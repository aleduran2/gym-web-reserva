const express    = require("express");
const cors       = require("cors");
const { query }  = require("./db");
const { procesarUsuario } = require("./reservar");
const { enviarClaseLlena } = require("./email");

const app         = express();
const CRON_SECRET = process.env.CRON_SECRET || "";

app.use(cors());
app.use(express.json());

// ── Health ──────────────────────────────────────────────────────────────────
app.get("/api/health", (_, res) => res.json({ ok: true }));

// ── Registro ────────────────────────────────────────────────────────────────
app.post("/api/register", async (req, res) => {
  const { nombre, email, password_tw } = req.body || {};
  if (!nombre || !email || !password_tw)
    return res.status(400).json({ ok: false, error: "Faltan datos" });

  try {
    const existe = await query("SELECT id FROM usuarios WHERE email=$1", [email]);
    if (existe.rows.length)
      return res.status(409).json({ ok: false, error: "Ya existe una cuenta con ese email" });

    await query(
      "INSERT INTO usuarios (nombre, email, password_tw) VALUES ($1,$2,$3)",
      [nombre, email, password_tw]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: "Error interno" });
  }
});

// ── Login ───────────────────────────────────────────────────────────────────
app.post("/api/login", async (req, res) => {
  const { email, password_tw } = req.body || {};
  try {
    const r = await query(
      "SELECT id, nombre, email, clase, hora, activo FROM usuarios WHERE email=$1 AND password_tw=$2",
      [email, password_tw]
    );
    if (!r.rows.length)
      return res.status(401).json({ ok: false, error: "Credenciales inválidas" });

    res.json({ ok: true, usuario: r.rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: "Error interno" });
  }
});

// ── Setup: guardar clase y horario ──────────────────────────────────────────
app.post("/api/setup", async (req, res) => {
  const { email, clase, hora } = req.body || {};
  if (!email || !clase || !hora)
    return res.status(400).json({ ok: false, error: "Faltan datos" });

  try {
    await query(
      "UPDATE usuarios SET clase=$1, hora=$2 WHERE email=$3",
      [clase, hora, email]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: "Error interno" });
  }
});

// ── Historial ───────────────────────────────────────────────────────────────
app.get("/api/historial/:email", async (req, res) => {
  try {
    const u = await query("SELECT id FROM usuarios WHERE email=$1", [req.params.email]);
    if (!u.rows.length) return res.status(404).json({ ok: false, error: "Usuario no encontrado" });

    const r = await query(
      `SELECT fecha, estado, detalle, creado_en
       FROM reservas WHERE usuario_id=$1
       ORDER BY creado_en DESC LIMIT 30`,
      [u.rows[0].id]
    );
    res.json({ ok: true, historial: r.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: "Error interno" });
  }
});

// ── Reservar ahora (manual desde la web) ────────────────────────────────────
app.post("/api/reservar-ahora/:email", async (req, res) => {
  try {
    const u = await query(
      "SELECT * FROM usuarios WHERE email=$1",
      [req.params.email]
    );
    if (!u.rows.length) return res.status(404).json({ ok: false, error: "Usuario no encontrado" });

    const usuario   = u.rows[0];
    const resultado = await procesarUsuario(usuario);

    await query(
      "INSERT INTO reservas (usuario_id, fecha, estado, detalle) VALUES ($1, CURRENT_DATE, $2, $3)",
      [usuario.id, resultado.estado, resultado.detalle]
    );

    if (resultado.estado === "llena") {
      await enviarClaseLlena(usuario, resultado.detalle);
    }

    res.json(resultado);
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: "Error interno" });
  }
});

// ── Reservar todos (cron diario) ─────────────────────────────────────────────
app.post("/api/reservar-todos", async (req, res) => {
  if (CRON_SECRET && req.headers["x-cron-secret"] !== CRON_SECRET)
    return res.status(403).json({ ok: false, error: "No autorizado" });

  try {
    const usuarios = await query(
      "SELECT * FROM usuarios WHERE activo=true AND clase IS NOT NULL AND hora IS NOT NULL"
    );
    const resultados = [];

    for (const usuario of usuarios.rows) {
      const resultado = await procesarUsuario(usuario);

      await query(
        "INSERT INTO reservas (usuario_id, fecha, estado, detalle) VALUES ($1, CURRENT_DATE, $2, $3)",
        [usuario.id, resultado.estado, resultado.detalle]
      );

      if (resultado.estado === "llena") {
        await enviarClaseLlena(usuario, resultado.detalle);
      }

      console.log(`[${usuario.nombre}] ${resultado.estado} — ${resultado.detalle}`);
      resultados.push({ nombre: usuario.nombre, ...resultado });
    }

    res.json({ ok: true, resultados });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: "Error interno" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend corriendo en puerto ${PORT}`));

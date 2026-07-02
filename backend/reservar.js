const BASE_URL = "https://gonnetbox.turnosweb.com";
const AGENDA   = "0_227_0";

function mananaStr() {
  const tz = "America/Argentina/Buenos_Aires";
  const ahora = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
  ahora.setDate(ahora.getDate() + 1);
  const yyyy = ahora.getFullYear();
  const mm   = String(ahora.getMonth() + 1).padStart(2, "0");
  const dd   = String(ahora.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

function horaACodigo(h) {
  h = String(h).trim();
  if (h.includes(":")) {
    const [hh, mm = "00"] = h.split(":");
    return `${hh.padStart(2,"0")}${mm.padStart(2,"0")}00`;
  }
  return h.padStart(6, "0");
}

const HDR = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
  "Accept": "application/json, text/javascript, */*; q=0.01",
  "Accept-Language": "es-AR,es;q=0.9",
  "X-Requested-With": "XMLHttpRequest",
  "Referer": BASE_URL + "/",
  "Origin": BASE_URL,
};

async function req(url, opts, jar) {
  const headers = { ...HDR, ...(jar.cookie ? { Cookie: jar.cookie } : {}), ...(opts.headers || {}) };
  const res = await fetch(url, { ...opts, headers });
  const sc = res.headers.get("set-cookie");
  if (sc) jar.cookie = sc.split(";")[0];
  return res;
}

async function procesarUsuario(usuario) {
  const jar    = { cookie: "" };
  const fecha  = mananaStr();
  const hora   = horaACodigo(usuario.hora);

  // 1. Obtener cookie de sesión
  await req(BASE_URL, {}, jar);

  // 2. Login
  const lRes  = await req(`${BASE_URL}/web/loginajax`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ user: usuario.email, pass: usuario.password_tw }),
  }, jar);
  const lData = await lRes.json();
  if (lData.ok !== 1) return { ok: false, estado: "error", detalle: "Login fallido" };

  // 3. Obtener clases
  const cRes  = await req(`${BASE_URL}/web/calendar`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ ft: "1", dateform: fecha, agenda: AGENDA }),
  }, jar);
  const cData = await cRes.json();
  const clases = (cData.lines || []).flatMap(l => l.data || []);

  // 4. Encontrar la clase
  const prefix = `227_${fecha}_${hora}`;
  const clase  = clases.find(c => (c.id || "").startsWith(prefix));

  if (!clase)                          return { ok: true,  estado: "ok",    detalle: `Sin clase a las ${hora.slice(0,2)}:${hora.slice(2,4)} — día no hábil` };
  if (parseInt(clase.disp, 10) === 0)  return { ok: false, estado: "llena", detalle: `Clase de ${hora.slice(0,2)}:${hora.slice(2,4)} llena` };

  // 5. Reservar
  const rRes  = await req(`${BASE_URL}/web/reservar`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ id: `${clase.id}_${clase.idt}` }),
  }, jar);
  const rData = await rRes.json();

  if (rData.ok === 1) return { ok: true,  estado: "ok",    detalle: `Reservado: ${rData.t_smldate} — ${rData.name}` };
  return               { ok: false, estado: "error", detalle: String(rData.err || "Error desconocido") };
}

module.exports = { procesarUsuario, mananaStr };

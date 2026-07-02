import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { getUsuario } from "../lib/auth";
import Nav from "../components/Nav";

export default function Home() {
  const usuario   = getUsuario();
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  const reservarAhora = async () => {
    setLoading(true);
    setResultado(null);
    try {
      const res = await api.reservarAhora(usuario.email);
      setResultado(res);
    } catch {
      setResultado({ ok: false, estado: "error", detalle: "No se pudo conectar con el servidor" });
    } finally {
      setLoading(false);
    }
  };

  const tieneSetup = usuario?.clase && usuario?.hora;

  return (
    <>
      <Nav />
      <div className="main-content">

        {tieneSetup ? (
          <div className="status-box ok">
            <div className="status-emoji">✅</div>
            <div className="status-texto">
              Reservando <strong>{usuario.clase}</strong> todos los días a las <strong>{usuario.hora}</strong>
            </div>
            <p style={{ marginTop: 6, color: "#555", fontSize: 13 }}>
              El cron corre automáticamente a las 00:01
            </p>
          </div>
        ) : (
          <div className="status-box setup">
            <div className="status-emoji">⚙️</div>
            <div className="status-texto">Todavía no configuraste tu clase</div>
          </div>
        )}

        {resultado && (
          <div style={{ marginBottom: 16 }}>
            <p className={resultado.ok ? "success" : "error"}>
              {resultado.ok ? "✅" : "❌"} {resultado.detalle}
            </p>
          </div>
        )}

        {tieneSetup && (
          <button className="btn" onClick={reservarAhora} disabled={loading}>
            {loading ? "Reservando..." : "Reservar ahora"}
          </button>
        )}

        <button className="btn secondary" onClick={() => navigate("/setup")}>
          {tieneSetup ? "Cambiar clase/horario" : "Configurar mi clase"}
        </button>

        <button className="btn secondary" onClick={() => navigate("/historial")}>
          Ver historial del mes
        </button>

      </div>
    </>
  );
}

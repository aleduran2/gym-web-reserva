import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { getUsuario, setUsuario } from "../lib/auth";
import Nav from "../components/Nav";

const HORAS = ["07:00","08:00","09:00","10:00","11:00","14:00","17:00","18:00","19:00","20:00"];

export default function Setup() {
  const usuario   = getUsuario();
  const [clase, setClase]   = useState(usuario?.clase || "Crossfit / Functional");
  const [hora, setHora]     = useState(usuario?.hora  || "08:00");
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.setup({ email: usuario.email, clase, hora });
      if (res.ok) {
        setUsuario({ ...usuario, clase, hora });
        navigate("/");
      } else {
        setError(res.error || "Error al guardar");
      }
    } catch {
      setError("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Nav />
      <div className="main-content">
        <div className="card">
          <h2>Configurar mi clase</h2>
          <p>Elegí la clase y horario que se va a reservar todos los días automáticamente.</p>

          <form onSubmit={submit}>
            <label>Tipo de clase</label>
            <input
              type="text"
              value={clase}
              onChange={e => setClase(e.target.value)}
              placeholder="Ej: Crossfit / Functional"
            />

            <label>Horario preferido</label>
            <div className="chips">
              {HORAS.map(h => (
                <button
                  key={h} type="button"
                  className={`chip ${hora === h ? "selected" : ""}`}
                  onClick={() => setHora(h)}
                >
                  {h}
                </button>
              ))}
            </div>

            {error && <p className="error">{error}</p>}
            <button className="btn" disabled={loading}>
              {loading ? "Guardando..." : "Guardar configuración"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { getUsuario } from "../lib/auth";
import Nav from "../components/Nav";

export default function Historial() {
  const usuario  = getUsuario();
  const navigate = useNavigate();
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.historial(usuario.email).then(res => {
      setItems(res.historial || []);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <Nav />
      <div className="main-content">
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <button
            onClick={() => navigate("/")}
            style={{ background:"none", border:"none", cursor:"pointer", fontSize:20 }}
          >←</button>
          <h2 style={{ margin:0 }}>Historial del mes</h2>
        </div>

        {loading ? (
          <p style={{ textAlign:"center", color:"#999" }}>Cargando...</p>
        ) : items.length === 0 ? (
          <p style={{ textAlign:"center", color:"#999", marginTop:40 }}>
            Todavía no hay reservas registradas.
          </p>
        ) : (
          <ul className="historial-list">
            {items.map((item, i) => (
              <li key={i} className={`historial-item ${item.estado}`}>
                <div className="historial-fecha">
                  {new Date(item.creado_en).toLocaleString("es-AR", {
                    dateStyle: "medium", timeStyle: "short"
                  })}
                </div>
                <div className="historial-detalle">
                  {item.estado === "ok"    && "✅ "}
                  {item.estado === "llena" && "⚠️ "}
                  {item.estado === "error" && "❌ "}
                  {item.detalle}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

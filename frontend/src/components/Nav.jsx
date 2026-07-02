import { useNavigate } from "react-router-dom";
import { clearUsuario, getUsuario } from "../lib/auth";

export default function Nav() {
  const navigate = useNavigate();
  const usuario  = getUsuario();

  const logout = () => {
    clearUsuario();
    navigate("/login");
  };

  return (
    <nav className="nav">
      <span className="nav-title">🏋️ Gonnet Box</span>
      <div style={{ display:"flex", alignItems:"center", gap:16 }}>
        <span style={{ color:"#aaa", fontSize:14 }}>{usuario?.nombre}</span>
        <button className="nav-logout" onClick={logout}>Salir</button>
      </div>
    </nav>
  );
}

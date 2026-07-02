import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";
import { setUsuario } from "../lib/auth";

export default function Login() {
  const [form, setForm]     = useState({ email: "", password_tw: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.login(form);
      if (res.ok) {
        setUsuario(res.usuario);
        navigate(res.usuario.clase ? "/" : "/setup");
      } else {
        setError(res.error || "Credenciales inválidas");
      }
    } catch {
      setError("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <div className="logo">🏋️</div>
        <h1>Gonnet Box</h1>
        <p style={{ marginBottom: 8 }}>Reserva automática de clases</p>

        <form onSubmit={submit}>
          <label>Email de TurnosWeb</label>
          <input
            type="email" required autoComplete="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
          <label>Contraseña de TurnosWeb</label>
          <input
            type="password" required
            value={form.password_tw}
            onChange={e => setForm(f => ({ ...f, password_tw: e.target.value }))}
          />
          {error && <p className="error">{error}</p>}
          <button className="btn" disabled={loading}>{loading ? "Ingresando..." : "Ingresar"}</button>
        </form>

        <p className="link">¿No tenés cuenta? <Link to="/register">Registrate</Link></p>
      </div>
    </div>
  );
}

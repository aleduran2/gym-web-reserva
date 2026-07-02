import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";

export default function Register() {
  const [form, setForm]     = useState({ nombre: "", email: "", password_tw: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.register(form);
      if (res.ok) {
        navigate("/login");
      } else {
        setError(res.error || "No se pudo registrar");
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
        <h1>Crear cuenta</h1>
        <p style={{ marginBottom: 8 }}>Ingresá tus datos de TurnosWeb</p>

        <form onSubmit={submit}>
          <label>Nombre completo</label>
          <input
            type="text" required
            value={form.nombre}
            onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
          />
          <label>Email de TurnosWeb</label>
          <input
            type="email" required
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
          <button className="btn" disabled={loading}>{loading ? "Creando..." : "Crear cuenta"}</button>
        </form>

        <p className="link">¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link></p>
      </div>
    </div>
  );
}

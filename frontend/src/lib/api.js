const BASE = import.meta.env.VITE_API_URL || "";

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  return res.json();
}

export const api = {
  register:     (data)  => post("/api/register", data),
  login:        (data)  => post("/api/login", data),
  setup:        (data)  => post("/api/setup", data),
  historial:    (email) => get(`/api/historial/${encodeURIComponent(email)}`),
  reservarAhora:(email) => post(`/api/reservar-ahora/${encodeURIComponent(email)}`, {}),
};

const KEY = "gym_usuario";

export function getUsuario() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setUsuario(u) {
  localStorage.setItem(KEY, JSON.stringify(u));
}

export function clearUsuario() {
  localStorage.removeItem(KEY);
}

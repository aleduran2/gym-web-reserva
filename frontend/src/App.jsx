import { Routes, Route, Navigate } from "react-router-dom";
import { getUsuario } from "./lib/auth";
import Login      from "./pages/Login";
import Register   from "./pages/Register";
import Setup      from "./pages/Setup";
import Home       from "./pages/Home";
import Historial  from "./pages/Historial";

function PrivateRoute({ children }) {
  return getUsuario() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/"         element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/setup"    element={<PrivateRoute><Setup /></PrivateRoute>} />
      <Route path="/historial"element={<PrivateRoute><Historial /></PrivateRoute>} />
      <Route path="*"         element={<Navigate to="/" replace />} />
    </Routes>
  );
}

const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.EMAIL_FROM || "Gonnet Box <reservas@resend.dev>";

async function enviarClaseLlena(usuario, detalle) {
  try {
    await resend.emails.send({
      from: FROM,
      to:   usuario.email,
      subject: "⚠️ No se pudo reservar tu clase de mañana",
      html: `
        <h2>Hola ${usuario.nombre} 👋</h2>
        <p>No pudimos reservar tu clase de mañana porque <strong>está llena</strong>.</p>
        <p><strong>Detalle:</strong> ${detalle}</p>
        <p>Por favor, reservá manualmente en 
          <a href="https://gonnetbox.turnosweb.com">TurnosWeb</a>.
        </p>
        <br>
        <p style="color:#999;font-size:12px">Gonnet Box — Reserva Automática</p>
      `,
    });
    console.log(`Email enviado a ${usuario.email}`);
  } catch (e) {
    console.error(`Error enviando email a ${usuario.email}:`, e.message);
  }
}

module.exports = { enviarClaseLlena };

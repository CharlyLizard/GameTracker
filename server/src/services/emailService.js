const nodemailer = require('nodemailer');

const FRONTEND_URL = 'https://gametracker-navy.vercel.app'; // Usa tu dominio de Vercel

async function enviarCorreoBienvenida(email, nombre, token) {
  console.log('[emailService] Creando cuenta de prueba Ethereal...');
  const testAccount = await nodemailer.createTestAccount();

  console.log('[emailService] Datos de la cuenta Ethereal:', testAccount);

  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  // Para verificación:
  const verificationUrl = `${FRONTEND_URL}/verify?token=${token}`;
  const html = `
  <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 40px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; margin: auto; background: #18181b; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.25);">
      <tr>
        <td style="padding: 32px 32px 16px 32px; text-align: center;">
          <img src="https://cdn-icons-png.flaticon.com/512/1055/1055687.png" alt="GameTracker" width="64" style="margin-bottom: 16px;" />
          <h2 style="color: #fff; font-family: 'Segoe UI', Arial, sans-serif; font-size: 2rem; margin: 0 0 8px 0;">
            ¡Bienvenido a <span style="color: #a78bfa;">GameTracker</span>, ${nombre}!
          </h2>
          <p style="color: #d1d5db; font-size: 1.1rem; margin: 0 0 24px 0;">
            Gracias por registrarte. Para empezar a disfrutar de todas las funciones, verifica tu cuenta haciendo clic en el siguiente botón:
          </p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(90deg, #8b5cf6, #ec4899); color: #fff; border-radius: 8px; font-size: 1.1rem; font-weight: bold; text-decoration: none; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(139,92,246,0.2);">
            Verificar cuenta
          </a>
          <p style="color: #a1a1aa; font-size: 0.95rem; margin-top: 32px;">
            Si el botón no funciona, copia y pega este enlace en tu navegador:<br/>
            <span style="color: #818cf8;">${verificationUrl}</span>
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding: 16px 32px 32px 32px; text-align: center;">
          <p style="color: #71717a; font-size: 0.9rem;">
            ¡Nos vemos dentro!<br/>
            El equipo de <span style="color: #a78bfa;">GameTracker</span>
          </p>
        </td>
      </tr>
    </table>
  </div>
`;

  const mailOptions = {
    from: '"GameTracker" <noreply@gametrackerapp.com>',
    to: email,
    subject: 'Bienvenido a GameTracker - Verifica tu cuenta',
    html,
  };

  console.log('[emailService] Datos del correo:', mailOptions);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[emailService] Correo enviado:', info.messageId);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('[emailService] Vista previa:', previewUrl);
    return { info, previewUrl };
  } catch (error) {
    console.error('[emailService] Error al enviar el correo:', error);
    throw error;
  }
}
async function enviarCorreoRecuperacion(email, nombre, token) {
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  // Para recuperación:
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
  const html = `
  <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 40px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; margin: auto; background: #18181b; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.25);">
      <tr>
        <td style="padding: 32px 32px 16px 32px; text-align: center;">
          <img src="https://cdn-icons-png.flaticon.com/512/1055/1055687.png" alt="GameTracker" width="64" style="margin-bottom: 16px;" />
          <h2 style="color: #fff; font-family: 'Segoe UI', Arial, sans-serif; font-size: 2rem; margin: 0 0 8px 0;">
            Recupera tu contraseña en <span style="color: #a78bfa;">GameTracker</span>
          </h2>
          <p style="color: #d1d5db; font-size: 1.1rem; margin: 0 0 24px 0;">
            Hola <b>${nombre}</b>,<br>
            Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.<br>
            Haz clic en el siguiente botón para continuar:
          </p>
          <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(90deg, #8b5cf6, #ec4899); color: #fff; border-radius: 8px; font-size: 1.1rem; font-weight: bold; text-decoration: none; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(139,92,246,0.2);">
            Restablecer contraseña
          </a>
          <p style="color: #a1a1aa; font-size: 0.95rem; margin-top: 32px;">
            Si el botón no funciona, copia y pega este enlace en tu navegador:<br/>
            <span style="color: #818cf8;">${resetUrl}</span>
          </p>
          <p style="color: #f87171; font-size: 0.95rem; margin-top: 24px;">
            Por seguridad, este enlace expirará en 30 minutos.<br>
            Si no solicitaste este cambio, ignora este correo.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding: 16px 32px 32px 32px; text-align: center;">
          <p style="color: #71717a; font-size: 0.9rem;">
            El equipo de <span style="color: #a78bfa;">GameTracker</span>
          </p>
        </td>
      </tr>
    </table>
  </div>
  `;

  const mailOptions = {
    from: '"GameTracker" <noreply@gametrackerapp.com>',
    to: email,
    subject: 'Recupera tu contraseña - GameTracker',
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('[emailService] Correo de recuperación enviado:', info.messageId);
    console.log('[emailService] Vista previa:', previewUrl);
    return { info, previewUrl };
  } catch (error) {
    console.error('[emailService] Error al enviar el correo de recuperación:', error);
    throw error;
  }
}
module.exports = { enviarCorreoBienvenida, enviarCorreoRecuperacion };

module.exports = { enviarCorreoBienvenida,enviarCorreoRecuperacion };
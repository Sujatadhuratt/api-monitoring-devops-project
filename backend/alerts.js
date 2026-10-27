const nodemailer = require("nodemailer");

async function sendFailureAlert(serviceName) {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, ALERT_TO, ALERT_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !ALERT_TO) {
    console.log(`[alert] ${serviceName} is DOWN. Email skipped: configure SMTP_* and ALERT_TO in .env.`);
    return { sent: false, reason: "SMTP not configured" };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: String(SMTP_SECURE).toLowerCase() === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });

  await transporter.sendMail({
    from: ALERT_FROM || SMTP_USER,
    to: ALERT_TO,
    subject: `[API Monitor] Service down: ${serviceName}`,
    text: `The demo monitoring dashboard marked "${serviceName}" as DOWN. Check http://localhost:8081`
  });
  return { sent: true };
}

module.exports = { sendFailureAlert };

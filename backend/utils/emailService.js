const nodemailer = require("nodemailer");

let transporterPromise = null;

const TRUE_VALUES = new Set(["true", "1", "yes"]);

function isProductionLike() {
  return (
    process.env.NODE_ENV === "production" ||
    Boolean(process.env.RENDER) ||
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.RAILWAY_ENVIRONMENT) ||
    Boolean(process.env.FLY_APP_NAME)
  );
}

function getEmailPassword() {
  return process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || process.env.SMTP_PASSWORD;
}

function getSmtpConfig() {
  const port = parseInt(process.env.EMAIL_PORT, 10) || 587;
  const secure =
    process.env.EMAIL_SECURE === undefined
      ? port === 465
      : TRUE_VALUES.has(String(process.env.EMAIL_SECURE).toLowerCase());

  return {
    host: process.env.EMAIL_HOST,
    port,
    secure,
    user: process.env.EMAIL_USER || process.env.SMTP_USER,
    pass: getEmailPassword(),
    from: process.env.EMAIL_FROM,
  };
}

function getMissingSmtpKeys(config) {
  const missing = [];

  if (!config.host) missing.push("EMAIL_HOST");
  if (!config.user) missing.push("EMAIL_USER");
  if (!config.pass) missing.push("EMAIL_PASSWORD");

  return missing;
}

function createEmailError(message, statusCode = 502) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function getEmailConfigStatus() {
  const config = getSmtpConfig();
  const missing = getMissingSmtpKeys(config);

  return {
    configured: missing.length === 0,
    productionLike: isProductionLike(),
    missing,
    hostSet: Boolean(config.host),
    port: config.port,
    secure: config.secure,
    userSet: Boolean(config.user),
    passwordSet: Boolean(config.pass),
    fromSet: Boolean(config.from),
  };
}

/**
 * Get the transporter, auto-creating an Ethereal test account
 * if no valid production email config is set.
 */
async function getTransporter() {
  if (transporterPromise) return transporterPromise;

  const config = getSmtpConfig();
  const missing = getMissingSmtpKeys(config);

  // Use real SMTP whenever it is configured. This keeps production deploys from
  // depending on NODE_ENV being set exactly to "production".
  if (missing.length === 0) {
    transporterPromise = Promise.resolve(
      nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.pass,
        },
      })
    );
    return transporterPromise;
  }

  if (isProductionLike()) {
    throw createEmailError(
      `Email SMTP is not configured. Missing: ${missing.join(
        ", "
      )}. Add these environment variables in your production backend service.`,
      503
    );
  }

  // Development / demo fallback: auto-create Ethereal test account
  console.log("No complete EMAIL_* config found - using Ethereal test account for emails.");
  transporterPromise = nodemailer.createTestAccount().then((account) => {
    console.log("Ethereal account created:", account.user);
    console.log("SMTP CONFIG", {
  host: config.host,
  port: config.port,
  secure: config.secure,
  user: config.user,
  passwordSet: !!config.pass,
});
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: account.user,
        pass: account.pass,
      },
    });
  });

  return transporterPromise;
}

/**
 * Send a match introduction email
 * @param {Object} customer - Customer profile (receiver)
 * @param {Object} match - Match profile (being suggested)
 * @returns {Promise<Object>} Result with messageId and optional previewUrl
 */
async function sendMatchEmail(customer, match) {
  if (!customer.email) {
    throw new Error("Customer email is required");
  }

  const emailTemplate = `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      <h2 style="color: #2563eb;">Hi ${customer.firstName},</h2>

      <p>We found a great match for you! Meet:</p>

      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #1f2937;">${match.firstName} ${match.lastName || ""}</h3>

        <p style="margin: 5px 0;"><strong>Age:</strong> ${match.age}</p>
        <p style="margin: 5px 0;"><strong>City:</strong> ${match.city}</p>
        <p style="margin: 5px 0;"><strong>Profession:</strong> ${match.designation || match.profession || "N/A"}</p>
        ${match.income ? `<p style="margin: 5px 0;"><strong>Income:</strong> Rs. ${Number(match.income).toLocaleString("en-IN")}</p>` : ""}
        ${match.education ? `<p style="margin: 5px 0;"><strong>Education:</strong> ${match.education}</p>` : ""}

        ${match.fitLabel ? `<p style="margin-top: 10px;"><strong>Match Fit:</strong> <span style="color: #16a34a; font-weight: bold;">${match.fitLabel}</span> (${match.score}%)</p>` : ""}
      </div>

      <p>Our matchmakers have reviewed this profile and believe you two could have great compatibility.</p>

      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        Best regards,<br>
        <strong>The Date Crew (TDC) Matchmaking Team</strong>
      </p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">
        This is a notification from your matchmaker. If you have any questions, please reach out to your assigned matchmaker.
      </p>
    </div>
  `;

  const config = getSmtpConfig();
  const mailOptions = {
    from: config.from || config.user || "noreply@thedatecrew.com",
    to: customer.email,
    subject: `New Match Found! ${match.firstName} wants to connect with you`,
    html: emailTemplate,
  };

  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);

    const previewUrl = nodemailer.getTestMessageUrl(info);

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl || null,
    };
  } catch (error) {
    console.error("Error sending email:", error);

    if (error.statusCode) {
      throw error;
    }

    if (error.code === "EAUTH") {
      throw createEmailError(
        "Email authentication failed. Check EMAIL_USER and EMAIL_PASSWORD in production. For Gmail, use an App Password.",
        502
      );
    }

    if (["ECONNECTION", "ETIMEDOUT", "ESOCKET"].includes(error.code)) {
      throw createEmailError(
        "Could not connect to the email provider. Check EMAIL_HOST, EMAIL_PORT, and EMAIL_SECURE.",
        502
      );
    }

    throw createEmailError(`Failed to send email: ${error.message}`, 502);
  }
}

module.exports = { getEmailConfigStatus, sendMatchEmail };

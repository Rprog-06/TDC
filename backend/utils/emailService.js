const nodemailer = require("nodemailer");

// Configure email transporter
// For development/demo: use Ethereal (fake SMTP)
// For production: use your email provider (Gmail, SendGrid, etc.)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === "true" || false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send a match introduction email
 * @param {Object} customer - Customer profile (receiver)
 * @param {Object} match - Match profile (being suggested)
 * @returns {Promise<string>} - Preview URL or email info
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

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER || "noreply@thedatecrew.com",
    to: customer.email,
    subject: `New Match Found! 💕 ${match.firstName} wants to connect with you`,
    html: emailTemplate,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    
    // For Ethereal (demo): return preview URL
    if (process.env.NODE_ENV !== "production" && info.response.includes("Queued")) {
      return {
        success: true,
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info),
      };
    }

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

module.exports = { sendMatchEmail };

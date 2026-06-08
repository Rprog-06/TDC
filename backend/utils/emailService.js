// const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendMatchEmail(customer, match) {
  if (!customer.email) {
    throw new Error("Customer email is required");
  }

  const html = `
    <h2>Hi ${customer.firstName},</h2>

    <p>We found a great match for you!</p>

    <div style="padding:15px;border:1px solid #ddd;">
      <h3>${match.firstName} ${match.lastName || ""}</h3>
      <p><b>Age:</b> ${match.age}</p>
      <p><b>City:</b> ${match.city}</p>
      <p><b>Profession:</b> ${
        match.designation || match.profession || "N/A"
      }</p>
    </div>

    <p>Best Regards,<br/>TDC Team</p>
  `;

  const msg = {
    to: customer.email,
    from: process.env.EMAIL_FROM,
    subject: `New Match Found! ${match.firstName} wants to connect with you`,
    html,
  };

  try {
    const response = await sgMail.send(msg);

    return {
      success: true,
      statusCode: response[0].statusCode,
    };
  } catch (error) {
    console.error("SendGrid Error:", error);

    if (error.response) {
      console.error(error.response.body);
    }

    throw new Error("Failed to send email");
  }
}

module.exports = { sendMatchEmail };
const express = require("express");
const { sendMatchEmail } = require("../utils/emailService");
const customers = require("../data/customer.json");
const profiles = require("../data/profiles.json");

const router = express.Router();

router.post("/send-match", async (req, res) => {
  const { customerId, matchId } = req.body;

  if (!customerId || !matchId) {
    return res.status(400).json({
      success: false,
      message: "customerId and matchId are required",
    });
  }

  try {
    // Find customer and match in data
    const customer = customers.find((c) => c.id === parseInt(customerId));
    const match = profiles.find((p) => p.id === parseInt(matchId));

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match profile not found",
      });
    }

    // Send email
    const emailResult = await sendMatchEmail(customer, match);

    res.json({
      success: true,
      message: `Match sent to ${customer.email}`,
      emailResult,
    });
  } catch (error) {
    console.error("Error in send-match:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send match",
    });
  }
});

module.exports = router;

const express = require("express");

const router = express.Router();

router.post("/send-match", (req, res) => {

  const {
    customerId,
    matchId
  } = req.body;

  if (!customerId || !matchId) {
    return res.status(400).json({
      success: false,
      message: "customerId and matchId are required"
    });
  }

  res.json({
    success: true,
    message:
      `Match ${matchId} sent to customer ${customerId}`
  });
});

module.exports = router;

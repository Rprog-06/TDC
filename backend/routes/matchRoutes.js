const express = require("express");
const router = express.Router();

const {
  getMatches
} = require("../controllers/matchController");

router.get("/:id", getMatches);

module.exports = router;
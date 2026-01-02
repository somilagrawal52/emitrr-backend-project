// src/routes/leaderboard.js
const express = require("express");
const router = express.Router();
const { getLeaderboard } = require("../db/mongo");

router.get("/", async (req, res) => {
  const data = await getLeaderboard();
  res.json(data);
});

module.exports = router;

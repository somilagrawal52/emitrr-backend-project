const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

const gameSchema = new mongoose.Schema({
  players: [String],
  winner: String,
  endedAt: Date,
});

const leaderboardSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  wins: { type: Number, default: 0 },
});

const Game = mongoose.model("Game", gameSchema);
const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema);

// ---- DB Helpers ----
async function saveGameResult(data) {
  await Game.create(data);
}

async function incrementWin(username) {
  if (!username || username === "DRAW" || username === "BOT") return;

  await Leaderboard.findOneAndUpdate(
    { username },
    { $inc: { wins: 1 } },
    { upsert: true, new: true }
  );
}

async function getLeaderboard() {
  return Leaderboard.find().sort({ wins: -1 }).limit(10);
}

module.exports = {
  saveGameResult,
  incrementWin,
  getLeaderboard,
};

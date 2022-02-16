const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
  GuildId: String,
  UserId: String,
  inGame: { type: Boolean, default: false },
  inGameUsers: { type: Array, default: [] },
  mmrTotal: { type: Number, default: 100.0 },
  mmrPlayed: { type: Number, default: 0 },
  mmrWon: { type: Number, default: 0 },
  mmrLost: { type: Number, default: 0 },
  mmrWinStreak: { type: Number, default: 0 },
  mmrLoseStreak: { type: Number, default: 0 },
  mmrLastPlayed: { type: Number, default: 0 },
  mmrHighestWinStreak: { type: Number, default: 0 },
  mmrHighestLoseStreak: { type: Number, default: 0 },
});

module.exports = mongoose.model("mmr-users", userSchema);

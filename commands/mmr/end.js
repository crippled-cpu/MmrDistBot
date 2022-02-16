const userSchema = require("../../models/userSchema.js");
module.exports = {
  name: "end",
  aliases: ["quit"],
  category: "mmr",
  description: "End the duel",
  usage: "end duel",
  userPermissions: [],
  botPermissions: [],
  cooldown: 5,
  /**
   *
   * @param {Client} client
   * @param {Message} message
   * @param {String[]} args
   */
  run: async (client, message, args) => {
    if (!args[0] || args[0].toLowerCase() !== "duel") {
      return message.reply(
        `➜ Specify valid end duel command.\n┕\`${client.config.prefix}end duel\``
      );
    }
    const db = await userSchema.findOne({
      GuildId: message.guild.id,
      UserId: message.author.id,
    });
    if (!db) {
      new userSchema({
        GuildId: message.guild.id,
        UserId: message.author.id,
        inGame: false,
        inGameUsers: [],
        mmrTotal: 100.0,
        mmrWon: 0,
        mmrPlayed: 0,
        mmrLost: 0,
        mmrWinStreak: 0,
        mmrLoseStreak: 0,
        mmrLastPlayed: 0,
        mmrHighestWinStreak: 0,
        mmrHighestLoseStreak: 0,
      }).save();
      return message.reply(`➜ You have not started a duel yet.`);
    } else if (db.inGame == false) {
      return message.reply(`➜ You have not started a duel yet.`);
    } else if (db.inGame == true && db.inGameUsers.length > 1) {
      return message.reply(
        `➜ You can't end a duel that is in progress.\n┕ Type \`${client.config.prefix}win <winnerId>\` to end this duel.`
      );
    } else {
      await db.updateOne({
        inGame: false,
        inGameUsers: [],
      });
      return message.reply(`➜ You have ended the duel.`);
    }
  },
};

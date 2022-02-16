const { Message, Client } = require("discord.js");
const userSchema = require("../../models/userSchema");
const { gameVoiceChannelId } = require("../../config.json");
module.exports = {
  name: "start",
  aliases: [],
  category: "mmr",
  description: "Start a duel",
  usage: "start <d / duel>",
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
    if (message.member.voice.channelId !== gameVoiceChannelId) {
      return message.reply(
        `➜ Please join <#${gameVoiceChannelId}> before starting a duel.`
      );
    }
    let arr = ["d", "duel"];
    if (!arr.includes(args[0].toLowerCase())) {
      return message.reply(
        `➜ Please enter a valid duel command.\n┕ \`${client.config.prefix}start duel\``
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
        inGame: true,
        inGameUsers: [`${message.author.id}`],
        mmrTotal: 100.0,
        mmrPlayed: 0,
        mmrWon: 0,
        mmrLost: 0,
        mmrWinStreak: 0,
        mmrLoseStreak: 0,
        mmrLastPlayed: 0,
        mmrHighestWinStreak: 0,
        mmrHighestLoseStreak: 0,
      }).save();
      return message.reply(
        `➜ You have started a duel. Please add a user to play with\n┕ \`${client.config.prefix}add <@User>\``
      );
    } else {
      if (db.inGame == true && db.inGameUsers.length == 1) {
        return message.reply(
          `➜ You have already started a duel. Please add a user to play with\n┕ \`${client.config.prefix}add <@User>\``
        );
      } else if (db.inGame == true && db.inGameUsers.length == 2) {
        return message.reply(`➜ You are already in a duel.`);
      } else {
        await db.updateOne({
          inGame: true,
          inGameUsers: [`${message.author.id}`],
        });
        return message.reply(
          `➜ You have started a duel. Please add a user to play with\n┕ \`${client.config.prefix}add <@User>\``
        );
      }
    }
  },
};

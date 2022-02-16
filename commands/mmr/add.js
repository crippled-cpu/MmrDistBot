const { Message, Client } = require("discord.js");
const userSchema = require("../../models/userSchema");
const { gameVoiceChannelId, gameTextChannelId } = require("../../config.json");
module.exports = {
  name: "add",
  aliases: ["allow"],
  category: "mmr",
  description: "Add a user to duel",
  usage: "add <@User / UserId / Username / Nickname / UserTag / Discriminator>",
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
    if (message.channelId !== gameTextChannelId) {
      return message.reply(
        `➜ This command can only be executed in <#${gameTextChannelId}>`
      );
    }
    const member =
      message.mentions.members.first() ||
      message.guild.members.cache.find(
        (m) => m.user.tag.toLowerCase() == args.join(" ").toLowerCase()
      ) ||
      message.guild.members.cache.find(
        (m) => m.user.discriminator == args.join(" ")
      ) ||
      message.guild.members.cache.find(
        (m) => m.user.username.toLowerCase() == args.join(" ").toLowerCase()
      ) ||
      message.guild.members.cache.find(
        (m) => m.displayName.toLowerCase() == args.join(" ").toLowerCase()
      ) ||
      message.guild.members.cache.get(args.join(" "));
    if (!member) {
      return message.reply(
        `➜ Please specify a valid Username, UserId, Nickname, Discriminator or Mention.`
      );
    }
    if (member.user.bot) {
      return message.reply(`➜ You cannot play with a bot.`);
    }
    if (member.id == message.author.id) {
      return message.reply(
        `➜ You can't play with yourself. Specify another member.`
      );
    }
    if (!member.voice.channel) {
      return message.reply(`➜ Specified member is not in a voice channel.`);
    }
    if (member.voice.channelId !== gameVoiceChannelId) {
      return message.reply(
        `➜ Specified member is not the game voice channel.\n┕ Please tell them to join <#${gameVoiceChannelId}>`
      );
    }
    let userIdArr = [];
    userIdArr.push(message.author.id);
    userIdArr.push(member.id);
    const db = await userSchema.findOne({
      GuildId: message.guild.id,
      UserId: message.author.id,
    });
    const memberDb = await userSchema.findOne({
      GuildId: message.guild.id,
      UserId: member.id,
    });

    if (!db) {
      new userSchema({
        GuildId: message.guild.id,
        UserId: message.author.id,
        inGame: false,
        inGameUsers: [],
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
      new userSchema({
        GuildId: message.guild.id,
        UserId: member.id,
        inGame: false,
        inGameUsers: [],
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
        `➜ You have to start a duel first before adding a user.\n┕ \`${client.config.prefix}start duel\``
      );
    }

    if (db.inGame == true && db.inGameUsers.length == 1) {
      if (!memberDb) {
        new userSchema({
          GuildId: message.guild.id,
          UserId: member.id,
          inGame: true,
          inGameUsers: [`${message.author.id}`, `${member.id}`],
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
      } else if (memberDb.inGame === true && memberDb.inGameUsers.length == 1) {
        return message.reply(
          `➜ **${member.user.username}** has also started a duel!`
        );
      } else if (memberDb.inGame === true && memberDb.inGameUsers.length > 1) {
        return message.reply(
          `➜ **${member.user.username}** is already in a duel!`
        );
      } else {
        for (let i = 0; i < userIdArr.length; i++) {
          await memberDb.updateOne({
            inGame: true,
            $push: {
              inGameUsers: `${userIdArr[i]}`,
            },
          });
        }
      }
      await db.updateOne({
        $push: {
          inGameUsers: `${member.id}`,
        },
      });
      return message.channel.send(
        `➜ A duel between ${member} and ${message.member} has been started.`
      );
    } else if (db.inGame === false) {
      return message.reply(
        `➜ You have to start a duel first before adding a user.\n┕ \`${client.config.prefix}start duel\``
      );
    } else {
      return message.reply(`➜ You are already in a duel.`);
    }
  },
};

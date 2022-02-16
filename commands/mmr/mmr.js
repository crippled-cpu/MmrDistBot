const { Message, Client, MessageEmbed } = require("discord.js");
const userSchema = require("../../models/userSchema");
module.exports = {
  name: "mmr",
  aliases: ["profile"],
  category: "mmr",
  description: "Check MMR profile",
  usage: "mmr [@User / UserId / Username / UserTag / Discriminator]",
  userPermissions: [],
  botPermissions: ["EMBED_LINKS"],
  cooldown: 5,
  /**
   *
   * @param {Client} client
   * @param {Message} message
   * @param {String[]} args
   */
  run: async (client, message, args) => {
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
      message.guild.members.cache.get(args.join(" ")) ||
      message.member;
    if (member.user.bot) {
      return message.reply(`You cannot play with a bot.`);
    }
    const mmrDb = await userSchema.findOne({
      GuildId: message.guild.id,
      UserId: member.id,
    });
    if (member.id == message.author.id && !mmrDb) {
      return message.reply(`➜ You have not played any duel yet!`);
    } else if (!mmrDb) {
      return message.reply(
        `➜ **${member.user.username}** has not played any duel yet!`
      );
    } else {
      const embed = new MessageEmbed()
        .setAuthor({
          name: `${member.user.username}'s MMR Profile`,
          iconURL: member.user.displayAvatarURL({ dynamic: true }),
        })
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setColor("RANDOM")
        .setDescription(
          `${
            mmrDb.inGameUsers.length < 2
              ? ""
              : `➜ Currently in duel with ${
                  member.id === mmrDb.inGameUsers[0]
                    ? `<@${mmrDb.inGameUsers[1]}>`
                    : `<@${mmrDb.inGameUsers[0]}>`
                } `
          }`
        )
        .addField(
          `_ _• Total MMR`,
          `┕ **[${mmrDb.mmrTotal}](https://www.youtube.com/watch?v=dQw4w9WgXcQ)**`,
          false
        )
        .addField(
          `_ _• Duels Played`,
          `┕ **[${mmrDb.mmrPlayed}](https://www.youtube.com/watch?v=dQw4w9WgXcQ)**`,
          true
        )
        .addField(
          `_ _• Duels Won`,
          `┕ **[${mmrDb.mmrWon}](https://www.youtube.com/watch?v=dQw4w9WgXcQ)**`,
          true
        )
        .addField(
          `_ _• Duels Lost`,
          `┕ **[${mmrDb.mmrLost}](https://www.youtube.com/watch?v=dQw4w9WgXcQ)**`,
          true
        )
        .addField(
          `_ _• Current Win Streak`,
          `┕ **[${mmrDb.mmrWinStreak}](https://www.youtube.com/watch?v=dQw4w9WgXcQ)**`,
          true
        )
        .addField(
          `_ _• Current Lose Streak`,
          `┕ **[${mmrDb.mmrLoseStreak}](https://www.youtube.com/watch?v=dQw4w9WgXcQ)**`,
          true
        )
        .addField(`** **`, `** **`, true)
        .addField(
          `_ _• Highest Win Streak`,
          `┕ **[${mmrDb.mmrHighestWinStreak}](https://www.youtube.com/watch?v=dQw4w9WgXcQ)**`,
          true
        )
        .addField(
          `_ _• Highest Lose Streak`,
          `┕ **[${mmrDb.mmrHighestLoseStreak}](https://www.youtube.com/watch?v=dQw4w9WgXcQ)**`,
          true
        )
        .addField(`** **`, `** **`, true)
        .addField(
          `_ _• Last Played`,
          `┕ ${
            mmrDb.mmrLastPlayed === 0
              ? `Not Yet Played`
              : `<t:${(mmrDb.mmrLastPlayed / 1000).toFixed(0)}:R> - <t:${(
                  mmrDb.mmrLastPlayed / 1000
                ).toFixed(0)}:F>`
          }`,
          false
        )
        .setTimestamp();
      return message
        .reply({
          embeds: [embed],
          allowedMentions: {
            repliedUser: false,
          },
        })
        .catch(() => {
          message.channel.send({
            embeds: [embed],
          });
        });
    }
  },
};

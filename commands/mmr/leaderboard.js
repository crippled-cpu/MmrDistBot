const { Message, Client, MessageEmbed } = require("discord.js");
const userSchema = require("../../models/userSchema");
const { button_pagination } = require("../../utils/button_pagination");
module.exports = {
  name: "leaderboard",
  aliases: ["lb"],
  category: "mmr",
  description: "Check MMR Leaderboard",
  usage: "leaderboard",
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
    const Guild = message.client.guilds.cache.get(message.guild?.id);
    const Members = Guild.members.cache.map((member) => member.id);
    function ordinal(i) {
      const j = i % 10;
      const k = i % 100;
      if (j == 1 && k != 11) return i + "st";
      if (j == 2 && k != 12) return i + "nd";
      if (j == 3 && k != 13) return i + "rd";
      else return i + "th";
    }
    userSchema
      .find({
        GuildId: message.guild?.id,
        UserId: Members,
      })
      .sort([["mmrTotal", "descending"]])
      .exec((err, ress) => {
        const embed = new MessageEmbed()
          .setColor("RANDOM")
          .setAuthor({
            name: `MMR Leaderboard`,
            iconURL: message.guild.iconURL({
              dynamic: true,
            }),
          })
          .setTimestamp();
        if (ress.length == 0) {
          return message.reply(`➜ No one has played a duel yet.`);
        } else {
          let leaderboard = "\u200b";
          let list = [];

          for (const res of ress.slice(0, 10)) {
            let member = message.guild.members.cache.get(res.UserId);
            leaderboard += `\n[\`${ordinal(ress.indexOf(res) + 1)}\`]- **${
              member?.user.tag || "Unknown Member"
            }** with **[${
              res.mmrTotal
            }](https://www.youtube.com/watch?v=dQw4w9WgXcQ)** \`MMR\`\n`;

            embed.setDescription(leaderboard);
          }
          list.push(embed);
          button_pagination(message, list);
        }
      });
  },
};

const {
  Message,
  Client,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} = require("discord.js");
const userSchema = require("../../models/userSchema");
const { gameVoiceChannelId, gameTextChannelId } = require("../../config.json");
module.exports = {
  name: "win",
  aliases: [],
  description: "Make a decision for the duel winner",
  usage: "win <Player Id / 1 or 2>",
  category: "mmr",
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
    if (message.channelId !== gameTextChannelId) {
      return message.reply(
        `➜ This command can only be executed in <#${gameTextChannelId}>`
      );
    }
    let userIdArray = ["1", "2"];
    if (!userIdArray.includes(args[0])) {
      return message.reply(
        `➜ Please specify a valid winner id.\n┕ \`${client.config.prefix}win 1\` or \`${client.config.prefix}win 2\``
      );
    }
    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setLabel("Agree")
        .setEmoji("✔️")
        .setStyle("SUCCESS")
        .setCustomId("yes"),
      new MessageButton()
        .setLabel("Disagree")
        .setEmoji("❌")
        .setStyle("PRIMARY")
        .setCustomId("no")
    );
    const db = await userSchema.findOne({
      GuildId: message.guild.id,
      UserId: message.author.id,
    });
    if (!db || db.inGame == false) {
      return message.reply(
        `➜ You have not started a duel yet!\n┕ \`${client.config.prefix}start duel\``
      );
    }
    if (db.inGame == true && db.inGameUsers.length == 1) {
      return message.reply(
        `➜ You have not added a second player yet!\n┕ \`${client.config.prefix}add <@User>\``
      );
    } else {
      let winner, loser;
      let a1, a2, d1, d2;
      let gameUsersArray = [];
      gameUsersArray.push(db.inGameUsers[0], db.inGameUsers[1]);
      if (args[0] == "1") {
        winner = gameUsersArray[0];
        loser = gameUsersArray[1];
      } else {
        winner = gameUsersArray[1];
        loser = gameUsersArray[0];
      }
      const winnerDb = await userSchema.findOne({
        GuildId: message.guild.id,
        UserId: winner,
      });

      const loserDb = await userSchema.findOne({
        GuildId: message.guild.id,
        UserId: loser,
      });
      const embed = new MessageEmbed()
        .setAuthor({
          name: `Ending the Duel`,
          iconURL: message.guild.iconURL({ dynamic: true }),
        })
        .setDescription(
          `➜ 1️⃣ <@${gameUsersArray[0]}> **vs** 2️⃣ <@${gameUsersArray[1]}>\n\n• This duel will end as soon as both players agree and <@${winner}> will be declared as winner.\n\n• Please use the buttons below to agree or disagree.`
        )
        .setColor("RANDOM")
        .setTimestamp();
      message.channel
        .send({ embeds: [embed], components: [row] })
        .then(async (message) => {
          const buttons = async (interaction) => {
            if (!gameUsersArray.includes(interaction.user.id)) {
              return interaction.reply({
                content: `Only <@${gameUsersArray[0]}> and <@${gameUsersArray[1]}> can make this decision.`,
                ephemeral: true,
              });
            }
            if (interaction.customId == `yes`) {
              if (interaction.user.id == gameUsersArray[0]) {
                if (a1 === "true" || d1 === "true") {
                  return interaction.reply({
                    content: `You have already made a decision`,
                    ephemeral: true,
                  });
                } else if (a2 === "true") {
                  a1 = "true";
                  update();
                  await interaction.deferUpdate();
                  row.components[0].setDisabled(true);
                  row.components[1].setDisabled(true);

                  return message.edit({
                    embeds: [
                      embed.setDescription(
                        `➜ 1️⃣ <@${gameUsersArray[0]}> **vs** 2️⃣ <@${gameUsersArray[1]}>\n\n\\✔️ <@${gameUsersArray[1]}> _Agreed_\n\\✔️ <@${gameUsersArray[0]}> _Agreed_\n\n🎉 Congratz <@${winner}>, you are the winner of this duel! 🎉`
                      ),
                    ],
                    components: [row],
                  });
                } else if (d2 === "true") {
                  a1 = "true";

                  await interaction.deferUpdate();
                  row.components[0].setDisabled(true);
                  row.components[1].setDisabled(true);
                  return message.edit({
                    embeds: [
                      embed.setDescription(
                        `➜ 1️⃣ <@${gameUsersArray[0]}> **vs** 2️⃣ <@${gameUsersArray[1]}>\n\n\\✔️ <@${gameUsersArray[1]}> _Agreed_\n\\❌ <@${gameUsersArray[0]}> _Disagreed_\n\n• No winner was declared. You can try again.`
                      ),
                    ],
                    components: [row],
                  });
                } else {
                  await interaction.deferUpdate();
                  a1 = "true";
                  return message.edit({
                    embeds: [
                      embed.setDescription(
                        `➜ 1️⃣ <@${gameUsersArray[0]}> **vs** 2️⃣ <@${gameUsersArray[1]}>\n\n• This duel will end as soon as both players agree and <@${winner}> will be declared as winner.\n\n\\✔️ <@${gameUsersArray[0]}> _Agreed_\n\n• _Waiting for <@${gameUsersArray[1]}>'s decision_`
                      ),
                    ],
                  });
                }
              } else {
                if (a2 === "true" || d2 === "true") {
                  return interaction.reply({
                    content: `You have already made a decision`,
                    ephemeral: true,
                  });
                } else if (a1 === "true") {
                  a2 = "true";
                  await interaction.deferUpdate();
                  update();
                  row.components[0].setDisabled(true);
                  row.components[1].setDisabled(true);
                  return message.edit({
                    embeds: [
                      embed.setDescription(
                        `➜ 1️⃣ <@${gameUsersArray[0]}> **vs** 2️⃣ <@${gameUsersArray[1]}>\n\n\\✔️ <@${gameUsersArray[0]}> _Agreed_\n\\✔️ <@${gameUsersArray[1]}> _Agreed_\n\n🎉 Congratz <@${winner}>, you are the winner of this duel! 🎉`
                      ),
                    ],
                    components: [row],
                  });
                } else if (d1 === "true") {
                  a2 = "true";

                  await interaction.deferUpdate();
                  row.components[0].setDisabled(true);
                  row.components[1].setDisabled(true);
                  return message.edit({
                    embeds: [
                      embed.setDescription(
                        `➜ 1️⃣ <@${gameUsersArray[0]}> **vs** 2️⃣ <@${gameUsersArray[1]}>\n\n\\❌ <@${gameUsersArray[0]}> _Disagreed_\n\\✔️ <@${gameUsersArray[1]}> _Agreed_\n\n• No winner was declared. You can try again.`
                      ),
                    ],
                    components: [row],
                  });
                } else {
                  await interaction.deferUpdate();
                  a2 = "true";

                  return message.edit({
                    embeds: [
                      embed.setDescription(
                        `➜ 1️⃣ <@${gameUsersArray[0]}> **vs** 2️⃣ <@${gameUsersArray[1]}>\n\n• This duel will end as soon as both players agree and <@${winner}> will be declared as winner.\n\n\\✔️ <@${gameUsersArray[1]}> _Agreed_\n\n• _Waiting for <@${gameUsersArray[0]}>'s decision_`
                      ),
                    ],
                  });
                }
              }
            }
            if (interaction.customId == "no") {
              if (interaction.user.id == gameUsersArray[0]) {
                if (d1 === "true" || a1 === "true") {
                  return interaction.reply({
                    content: `You have already made a decision.`,
                    ephemeral: true,
                  });
                } else if (d2 === "true") {
                  d1 = "true";

                  await interaction.deferUpdate();
                  row.components[0].setDisabled(true);
                  row.components[1].setDisabled(true);
                  return message.edit({
                    embeds: [
                      embed.setDescription(
                        `➜ 1️⃣ <@${gameUsersArray[0]}> **vs** 2️⃣ <@${gameUsersArray[1]}>\n\n\\❌ <@${gameUsersArray[1]}> _Disagreed_\n\\❌ <@${gameUsersArray[0]}> _Disagreed_\n\n• No winner was declared. You can try again.`
                      ),
                    ],
                    components: [row],
                  });
                } else if (a2 === "true") {
                  d1 = "true";

                  await interaction.deferUpdate();
                  row.components[0].setDisabled(true);
                  row.components[1].setDisabled(true);
                  return message.edit({
                    embeds: [
                      embed.setDescription(
                        `➜ 1️⃣ <@${gameUsersArray[0]}> **vs** 2️⃣ <@${gameUsersArray[1]}>\n\n\\✔️ <@${gameUsersArray[1]}> _Agreed_\n\\❌ <@${gameUsersArray[0]}> _Disagreed_\n\n• No winner was declared. You can try again.`
                      ),
                    ],
                    components: [row],
                  });
                } else {
                  d1 = "true";
                  await interaction.deferUpdate();
                  return message.edit({
                    embeds: [
                      embed.setDescription(
                        `➜ 1️⃣ <@${gameUsersArray[0]}> **vs** 2️⃣ <@${gameUsersArray[1]}>\n\n• This duel will end as soon as both players agree and <@${winner}> will be declared as winner.\n\n\\❌ <@${gameUsersArray[0]}> _Disagreed_\n\n• _Waiting for <@${gameUsersArray[1]}>'s decision_`
                      ),
                    ],
                  });
                }
              } else {
                if (d2 === "true" || a2 === "true") {
                  return interaction.reply({
                    content: `You have already made a decision`,
                    ephemeral: true,
                  });
                } else if (d1 === "true") {
                  d2 = "true";
                  await interaction.deferUpdate();
                  row.components[0].setDisabled(true);
                  row.components[1].setDisabled(true);
                  return message.edit({
                    embeds: [
                      embed.setDescription(
                        `➜ 1️⃣ <@${gameUsersArray[0]}> **vs** 2️⃣ <@${gameUsersArray[1]}>\n\n\\❌ <@${gameUsersArray[0]}> _Disagreed_\n\\❌ <@${gameUsersArray[1]}> _Disagreed_\n\n• No winner was declared. You can try again.`
                      ),
                    ],
                    components: [row],
                  });
                } else if (a1 === "true") {
                  d2 = "true";
                  await interaction.deferUpdate();
                  row.components[0].setDisabled(true);
                  row.components[1].setDisabled(true);
                  return message.edit({
                    embeds: [
                      embed.setDescription(
                        `➜ 1️⃣ <@${gameUsersArray[0]}> **vs** 2️⃣ <@${gameUsersArray[1]}>\n\n\\✔️ <@${gameUsersArray[0]}> _Agreed_\n\\❌ <@${gameUsersArray[1]}> _Disagreed_\n\n• No winner was declared. You can try again.`
                      ),
                    ],
                    components: [row],
                  });
                } else {
                  d2 = "true";
                  await interaction.deferUpdate();
                  return message.edit({
                    embeds: [
                      embed.setDescription(
                        `➜ 1️⃣ <@${gameUsersArray[0]}> **vs** 2️⃣ <@${gameUsersArray[1]}>\n\n• This duel will end as soon as both players agree and <@${winner}> will be declared as winner.\n\n\\❌ <@${gameUsersArray[1]}> _Disagreed_\n\n• _Waiting for <@${gameUsersArray[0]}>'s decision_`
                      ),
                    ],
                  });
                }
              }
            }
          };

          const filter = (interaction) => {
            return !interaction.user.bot;
          };
          const collector = message.createMessageComponentCollector({
            filter,
            componentType: "BUTTON",
            time: 60000 * 5,
            error: ["time"],
          });
          collector.on("collect", buttons);
          collector.on("end", () => {
            if (
              (a1 === "true" && a2 === "true") || //Both agree
              (d1 === "true" && d2 === "true") || //Both Disagree
              (a1 === "true" && d2 === "true") || //1 Agree 2 Disagree
              (d1 === "true" && a2 === "true") || //1 Disagree 2 Agree
              (a2 === "true" && d2 === "true")
            ) {
              return;
            } else {
              row.components[0].setDisabled(true);
              row.components[1].setDisabled(true);
              message
                .edit({
                  embeds: [
                    embed
                      .setFooter({ text: `Time's up!` })
                      .setDescription(
                        `➜ 1️⃣ <@${gameUsersArray[0]}> **vs** 2️⃣ <@${gameUsersArray[1]}>\n\n• This duel will end as soon as both players agree and <@${winner}> will be declared as winner.\n\n• Decision making time has ended.\n• No winner was declared. You can try again.`
                      ),
                  ],
                  components: [row],
                })
                .catch((e) => {
                  return;
                });
            }
          });

          let mmrGained =1 /(1 + Math.pow(10, (loserDb.mmrTotal - winnerDb.mmrTotal) / 400));
          let newMmrWin = (winnerDb.mmrTotal + 40 * (1 - mmrGained)).toFixed(1);
          let newMmrLose = (loserDb.mmrTotal + 40 * (0 - mmrGained)).toFixed(1);
          if (newMmrWin < 0) {
            newMmrWin = 0;
          }
          if (newMmrLose < 0) {
            newMmrLose = 0;
          }
          //Update The Database:
          async function update() {
            await winnerDb.updateOne({
              inGame: false,
              inGameUsers: [],
              mmrLoseStreak: winnerDb.mmrLoseStreak - winnerDb.mmrLoseStreak,
              mmrTotal: newMmrWin,
              mmrWon: winnerDb.mmrWon + 1,
              mmrPlayed: winnerDb.mmrPlayed + 1,
              mmrWinStreak: winnerDb.mmrWinStreak + 1,
              mmrHighestWinStreak: winnerDb.mmrHighestWinStreak + 1,

              mmrLastPlayed: Date.now(),
            });
            if (winnerDb.mmrHighestWinStreak < winnerDb.mmrWinStreak) {
              await winnerDb.updateOne({
                mmrHighestWinStreak: winnerDb.mmrWinStreak,
              });
            }
            if (winnerDb.mmrHighestLoseStreak < winnerDb.mmrLoseStreak) {
              await winnerDb.updateOne({
                mmrHighestLoseStreak: winnerDb.mmrLoseStreak,
              });
            }
            await loserDb.updateOne({
              inGame: false,
              inGameUsers: [], 
              mmrTotal: newMmrLose,
              mmrLost: loserDb.mmrLost + 1,
              mmrPlayed: loserDb.mmrPlayed + 1,
              mmrWinStreak: loserDb.mmrWinStreak - loserDb.mmrWinStreak,
              mmrLoseStreak: loserDb.mmrLoseStreak + 1,
              mmrHighestLoseStreak: loserDb.mmrHighestLoseStreak + 1,
              mmrLastPlayed: Date.now(),
            });
            if (loserDb.mmrHighestWinStreak < loserDb.mmrWinStreak) {
              await loserDb.updateOne({
                mmrHighestWinStreak: loserDb.mmrWinStreak,
              });
            }
            if (loserDb.mmrHighestLoseStreak < loserDb.mmrLoseStreak) {
              await loserDb.updateOne({
                mmrHighestLoseStreak: loserDb.mmrLoseStreak,
              });
            }
          }
        });
    }
  },
};

/*BUTTON PAGINATION*/

const { MessageButton, Message, MessageActionRow } = require("discord.js");
/**
 *
 * @param {Message} message  - The message
 * @param {Array} embeds  - Array of embeds
 * @returns Button Pagination
 */

async function button_pagination(message, embeds) {
  if (!message || !embeds)
    throw new Error(console.log("Provide all valid arguments"));
  let onlyAuthor = message.author.id;
  let authorName = message.author;
  let index = 0;
  let button = new MessageActionRow().addComponents(
    new MessageButton().setCustomId(`e1`).setEmoji("◀️").setStyle("SUCCESS"),
    new MessageButton().setCustomId(`e3`).setEmoji("▶️").setStyle("SUCCESS")
  );
  if (embeds.length == 1) {
    button.components[0].setDisabled(true);
    button.components[1].setDisabled(true);
    let msg = await message.channel
      .send({
        embeds: [embeds[0]],
        components: [button],
      })
      .catch(() => {
        return;
      });
    return msg;
  } else {
    button.components[0].setDisabled(true);
    let msg = await message.channel
      .send({
        embeds: [embeds[0]],
        components: [button],
      })
      .then((message) => {
        const buttonID = [`e1`, `e3`];
        const buttons = async (interaction) => {
          if (interaction.user.id !== onlyAuthor) {
            return interaction
              .reply({
                content: `Only ${authorName} can use the buttons.`,
                ephemeral: true,
              })
              .catch(() => {
                return;
              });
          }
          if (!buttonID.includes(interaction.customId)) return;

          if (interaction.customId == `e1`) {
            index = index > 0 ? --index : embeds.length - 1;
            await interaction.deferUpdate().catch(() => {
              return;
            });

            if (index == 0) {
              button.components[0].setDisabled(true);
              await interaction.message
                .edit({
                  embeds: [embeds[index]],
                  components: [button],
                })
                .catch(() => {
                  return;
                });
            } else {
              await interaction.message
                .edit({
                  embeds: [embeds[index]],
                  components: [button],
                })
                .catch(() => {
                  return;
                });
            }
          } else if (interaction.customId == `e3`) {
            index = index + 1 < embeds.length ? ++index : 0;
            await interaction.deferUpdate().catch(() => {
              return;
            });
            if (index == embeds.length - 1) {
              button.components[1].setDisabled(true);
              await interaction.message
                .edit({
                  embeds: [embeds[index]],
                  components: [button],
                })
                .catch(() => {
                  return;
                });
            } else {
              await interaction.message
                .edit({
                  embeds: [embeds[index]],
                  components: [button],
                })
                .catch(() => {
                  return;
                });
            }
          }
        };

        const filter = (interaction) => {
          return !interaction.user.bot;
        };

        const collector = message.createMessageComponentCollector({
          filter,
          componentType: "BUTTON",
          time: 60000 * 2,
        });

        collector.on("collect", buttons);
        collector.on("end", () => {
          button.components[0].setDisabled(true);
          button.components[1].setDisabled(true);

          message
            .edit({
              components: [button],
            })
            .catch((e) => {
              return;
            });
        });
      });

    return msg;
  }
}
module.exports.button_pagination = button_pagination;

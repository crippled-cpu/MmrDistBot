const { Message, Client, MessageEmbed } = require("discord.js");

module.exports = {
  name: "help",
  aliases: ["commands"],
  description: "MMR Bot Commands List",
  usage: "help [commandName]",
  category: "mmr",
  userPermissions: [],
  botPermissions: ["EMBED_LINKS"],
  /**
   *
   * @param {Client} client
   * @param {Message} message
   * @param {String[]} args
   */
  run: async (client, message, args) => {
    let commandName = args[0];
    if (!commandName) {
      const embed = new MessageEmbed()
        .setAuthor({
          name: "MMR Commands",
          iconURL: client.user.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(
          `ā Hello \`${
            message.author.username
          }\`, Welcome to MMR Distribution Bot!!\nā Here is my Commands List\nā Type \`${
            client.config.prefix
          }help <commandName>\` to get more information about a specific command\n\n${client.commands
            .filter((m) => m.category == "mmr")
            .map((m) => `\\š¹\`${m.name}\` - ${m.description}`)
            .join("\n")}`
        )
        .setColor("#0099ff")
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
    } else {
      const command =
        client.commands.get(commandName.toLowerCase()) ||
        client.commands.find(
          (c) => c.aliases && c.aliases.includes(commandName.toLowerCase())
        );
      if (!command) return;
      const embed = new MessageEmbed()
        .setTitle(`Command \`${client.config.prefix}${command.name}\``)
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setDescription(`ā ${command.description}`)
        .setFooter({ text: `< > = Required, [ ] = Optional` })
        .addField(
          "_ _ā¢ Aliases",
          `${
            command.aliases.length
              ? `ā \`${command.aliases.join(", ")}\``
              : `ā \`None\``
          }`,
          true
        )
        .addField(
          "_ _ā¢ Category",
          `ā \`${command.category.toUpperCase()}\``,
          true
        )
        .addField(
          "_ _ā¢ Cooldown",
          `ā \`${command.cooldown || 0} seconds\``,
          true
        )
        .addField(
          "_ _ā¢ Usage",
          `ā \`${client.config.prefix}${command.usage}\``,
          true
        )

        .addField(
          "_ _ā¢ Bot Permissions",
          `${
            command.botPermissions.length
              ? `ā \`${command.botPermissions.join(", ")}\``
              : `ā \`None\``
          }`,
          false
        )
        .addField(
          "_ _ā¢ User Permissions",
          `${
            command.userPermissions.length
              ? `ā \`${command.userPermissions.join(", ")}\``
              : `ā \`None\``
          }`,
          false
        )
        .setColor("RANDOM");
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

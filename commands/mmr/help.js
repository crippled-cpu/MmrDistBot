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
          `➜ Hello \`${
            message.author.username
          }\`, Welcome to MMR Distribution Bot!!\n➜ Here is my Commands List\n➜ Type \`${
            client.config.prefix
          }help <commandName>\` to get more information about a specific command\n\n${client.commands
            .filter((m) => m.category == "mmr")
            .map((m) => `\\🔹\`${m.name}\` - ${m.description}`)
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
        .setDescription(`➜ ${command.description}`)
        .setFooter({ text: `< > = Required, [ ] = Optional` })
        .addField(
          "_ _• Aliases",
          `${
            command.aliases.length
              ? `┕ \`${command.aliases.join(", ")}\``
              : `┕ \`None\``
          }`,
          true
        )
        .addField(
          "_ _• Category",
          `┕ \`${command.category.toUpperCase()}\``,
          true
        )
        .addField(
          "_ _• Cooldown",
          `┕ \`${command.cooldown || 0} seconds\``,
          true
        )
        .addField(
          "_ _• Usage",
          `┕ \`${client.config.prefix}${command.usage}\``,
          true
        )

        .addField(
          "_ _• Bot Permissions",
          `${
            command.botPermissions.length
              ? `┕ \`${command.botPermissions.join(", ")}\``
              : `┕ \`None\``
          }`,
          false
        )
        .addField(
          "_ _• User Permissions",
          `${
            command.userPermissions.length
              ? `┕ \`${command.userPermissions.join(", ")}\``
              : `┕ \`None\``
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

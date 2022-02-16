const client = require("../index");
const { MessageEmbed, Collection } = require("discord.js");
const cooldowns = new Collection();
client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;
  if (!message.content.toLowerCase().startsWith(client.config.prefix)) return;
  const [cmd, ...args] = message.content
    .slice(client.config.prefix.length)
    .trim()
    .split(" ");
  const command =
    client.commands.get(cmd.toLowerCase()) ||
    client.commands.find((c) => c.aliases?.includes(cmd.toLowerCase()));
  if (!command) return;
  //Checking BOT and USER permissions
  if (!message.guild.me.permissions.has("SEND_MESSAGES")) {
    return;
  } else if (!message.guild.me.permissions.has("EMBED_LINKS")) {
    return message.reply(
      `➜ I don't have the \`${command.botPermissions
        .join(", ")
        .replace(/\_/g, " ")}\` permission(s)`
    );
  } else {
    if (!message.member.permissions.has(command.userPermissions || [])) {
      const userPermission = new MessageEmbed()
        .setTitle("MISSING PERMISSIONS")
        .setDescription(
          `You are missing the following permission(s)\n\`${command.userPermissions
            .join(", ")
            .replace(/\_/g, " ")}\``
        )
        .setColor("RED")
        .setTimestamp();
      return message.channel.send({ embeds: [userPermission] });
    }
    if (!message.guild.me.permissions.has(command.botPermissions || [])) {
      const botPermission = new MessageEmbed()
        .setTitle("MISSING PERMISSIONS")
        .setDescription(
          `I am missing the following permission(s)\n\`${command.botPermissions
            .join(", ")
            .replace(/\_/g, " ")}\``
        )
        .setColor("RED")
        .setTimestamp();
      return message.channel.send({ embeds: [botPermission] });
    }
  }
  //Checking Cooldown
  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Collection());
  }
  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 1) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message
        .reply({
          content: `[\`${timeLeft.toFixed(1)}s\`] You are on cooldown`,
          allowedMentions: {
            repliedUser: false,
          },
        })
        .catch(() => {
          return;
        });
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
  await command.run(client, message, args);
});

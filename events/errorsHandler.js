const client = require("../index.js");
const { MessageEmbed } = require("discord.js");
const { errorsLoggingChannel } = require("../config.json");
process.setMaxListeners(0);
let channel = client.channels.cache.get(`${errorsLoggingChannel}`);
if (!channel) return;
//Catching All Expected Errors
process.on("unhandledRejection", (reason, p) => {
  let e = new MessageEmbed()
    .setAuthor({ name: `Unhandled Rejection` })
    .setDescription(
      `**Error**\n\`\`\`js\n${require("util")
        .inspect(p)
        .substring(0, 4000)}\n\`\`\`\n**Reason**\n\`\`\`js\n${reason}\n\`\`\``
    )
    .setTimestamp()
    .setColor("#2F3136");
  return channel.send({ embeds: [e] }).catch(() => {
    return;
  });
});
process.on("uncaughtException", (err, origin) => {
  let e = new MessageEmbed()
    .setAuthor({ name: `Uncaught Exception` })
    .setDescription(
      `**Error**\n\`\`\`js\n${require("util")
        .inspect(err)
        .substring(0, 1000)}\n\`\`\`\n**Reason**\n\`\`\`js\n${origin.substring(
        0,
        3000
      )}\n\`\`\``
    )
    .setTimestamp()
    .setColor("#2F3136");
  return channel.send({ embeds: [e] }).catch(() => {
    return;
  });
});
process.on("uncaughtExceptionMonitor", (err, origin) => {
  let e = new MessageEmbed()
    .setAuthor({ name: `Unhandled Exception Monitor` })
    .setDescription(
      `**Error**\n\`\`\`js\n${require("util")
        .inspect(err)
        .substring(0, 2000)}\n\`\`\`\n**Reason**\n\`\`\`js\n${origin.substring(
        0,
        1500
      )}\n\`\`\``
    )
    .setTimestamp()
    .setColor("#2F3136");
  return channel.send({ embeds: [e] }).catch(() => {
    return;
  });
});

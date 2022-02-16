const client = require("../index");
client.on("ready", () => {
  client.user.setActivity(`${client.config.prefix}help`, {
    type: "WATCHING",
  });
  console.log(`${client.user.tag} Online!`);
});

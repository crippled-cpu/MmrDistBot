const { glob } = require("glob");
const { promisify } = require("util");
const { Client } = require("discord.js");
const mongoose = require("mongoose");

const globPromise = promisify(glob);

/**
 * @param {Client} client
 */
module.exports = async (client) => {
  // Commands
  const commandFiles = await globPromise(`${process.cwd()}/commands/**/*.js`);
  commandFiles.map((value) => {
    const file = require(value);
    const splitted = value.split("/");
    const directory = splitted[splitted.length - 2];

    if (file.name) {
      const properties = { directory, ...file };
      client.commands.set(file.name, properties);
    }
  });

  // Events
  const eventFiles = await globPromise(`${process.cwd()}/events/*.js`);
  eventFiles.map((value) => require(value));

  // mongoose database connection
  const { mongooseConnectionString } = require("../config.json");
  const dbOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: false,
    connectTimeoutMS: 30000,
    family: 4,
  };
  mongoose.connect(mongooseConnectionString, dbOptions);
  mongoose.Promise = global.Promise;
  mongoose.connection.on("connected", () => {
    console.log("MongoDb has been Connected!");
  });
  mongoose.connection.on("err", (err) => {
    console.error(`MongoDb connection Error: \n${err.stack}`);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDb connection Lost");
  });
};

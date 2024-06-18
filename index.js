const Discord = require("discord.js");
const { Client, Intents, Permissions, Collection } = require("discord.js");
const { Routes } = require("discord-api-types/v9");
const { clientId, guildId, token } = require("./config.json");
const config = require('./config.json');
const fs = require("fs");
const axios = require('axios').default;
const generated = new Set();
const commands = require('./deploy-commands.js')
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
require('./server'); 

client.commands = new Collection();
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity(`${config.status}`, { type: "WATCHING" }); // Set the bot's activity status
  /* You can change the activity type to:
   * LISTENING
   * WATCHING
   * COMPETING
   * STREAMING (you need to add a twitch.tv url next to type like this:   { type: "STREAMING", url: "https://twitch.tv/twitch_username_here"} )
   * PLAYING (default)
  */
});


client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand() && !interaction.isButton()) return;

  if (interaction.isCommand()) {
    // Handle command interactions
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
    }
  } else if (interaction.isButton()) {
    // Handle button interactions
    switch (interaction.customId) {
      case 'join':
        await joinQueue(interaction);
        break;
      case 'leave':
        await leaveQueue(interaction);
        break;
      case 'open':
        await openTicket(interaction);
        break;
    }
  }
});


client.login(process.env.token || token);

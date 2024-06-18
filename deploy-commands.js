    const fs = require("fs");
    const { REST } = require('@discordjs/rest');
    const { Routes } = require('discord-api-types/v9'); // Importing Routes from discord-api-types/v9
    const { clientId, token } = require("./config.json");

    const commands = [];
    const commandFiles = fs
      .readdirSync("./commands")
      .filter((file) => file.endsWith(".js"));

    console.log("Loading commands...");

    for (const file of commandFiles) {
      const command = require(`./commands/${file}`);

      if (command.data) {
        commands.push(command.data);
        console.log(`✅ Loaded command: ${command.data.name}`);
      } else {
        console.log(`❌ Skipped invalid command in file: ${file}`);
      }
    }

    const rest = new REST({ version: "9" }).setToken(process.env.token || token);

    (async () => {
      try {
        await rest.put(Routes.applicationCommands(clientId), {
          body: commands,
        });

        console.log("\n✅ Successfully registered application commands globally.");
      } catch (error) {
        console.error(error);
      }
    })();
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs/promises');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('websiteadd')
    .setDescription('Add a username to the specified list file.')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('The username to add.')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('gamemode')
        .setDescription('The gamemode (vanilla, nethpot, uhc, sword, smp).')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('tier')
        .setDescription('The tier (1 to 5 for high tier, 1 to 5 for low tier).')
        .setRequired(true)),

  async execute(interaction) {
    // Check if the user has the specified role ID
    const roleId = '1210300053235966002'; // Replace with the desired role ID
    if (!interaction.member.roles.cache.has(roleId)) {
      return await interaction.reply('You do not have permission to use this command.');
    }

    const username = interaction.options.getString('username');
    const gamemode = interaction.options.getString('gamemode').toLowerCase();
    const tier = interaction.options.getInteger('tier');

    // Validate gamemode and tier
    if (!['vanilla', 'nethpot', 'uhc', 'sword', 'smp'].includes(gamemode)) {
      return await interaction.reply('Invalid gamemode. Please specify one of "vanilla", "nethpot", "uhc", "sword", "smp".');
    }
    if (tier < 1 || tier > 5) {
      return await interaction.reply('Invalid tier. Please specify a tier between 1 and 5.');
    }

    try {
      let fileName;

      if (tier >= 1 && tier <= 5) {
        fileName = (tier <= 3) ? `${gamemode}_low${tier}.txt` : `${gamemode}_${tier}.txt`;
      } else {
        return await interaction.reply('Invalid tier. Please specify a tier between 1 and 5.');
      }

      const filePath = `./public/${fileName}`;

      // Check if the file exists
      await fs.access(filePath);

      // Append the username to the file with a newline character
      await fs.appendFile(filePath, username + '\n');

      await interaction.reply(`Successfully added ${username} to the ${gamemode} tier ${tier} list.`);
    } catch (error) {
      console.error('Error adding username to list:', error);
      await interaction.reply('An error occurred while adding the username to the list.');
    }
  },
};

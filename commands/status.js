const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const util = require('minecraft-server-util');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Get status information about a Minecraft server.')
    .addStringOption(option =>
      option.setName('ip')
        .setDescription('The IP address or domain of the Minecraft server.')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('port')
        .setDescription('The port of the Minecraft server (default: 25565).')),

  async execute(interaction) {
    const ip = interaction.options.getString('ip');
    const port = interaction.options.getInteger('port') || 25565;

    try {
      const status = await util.status(ip, { port });
      
      const embed = new MessageEmbed()
        .setColor('#00ff00')
        .setTitle('Minecraft Server Status')
        .addField('Server IP', `${ip}:${port}`)
        .addField('Online Players', `${status.onlinePlayers}/${status.maxPlayers}`)
        .addField('MOTD', status.description)
        .addField('Ping', `${status.latency} ms`)
        .setTimestamp();

      // Check if the server has an icon
      if (status.favicon) {
        embed.setThumbnail(`data:image/png;base64,${status.favicon.split(',')[1]}`);
      }

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching server status:', error);
      await interaction.reply({ content: 'Error fetching server status. Make sure the server IP and port are correct.', ephemeral: true });
    }
  },
};

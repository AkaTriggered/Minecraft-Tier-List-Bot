const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('report')
    .setDescription('Report a user with their Minecraft IGN and reason.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user you want to report')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('minecraft_ign')
        .setDescription('The Minecraft IGN of the reported user')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the report')
        .setRequired(true)),
  category: 'Moderation', // Change category if needed

  async execute(interaction) {
    const reportedUser = interaction.options.getUser('user');
    const minecraftIGN = interaction.options.getString('minecraft_ign');
    const reason = interaction.options.getString('reason');

    // Send report embed to the specified channel
    const channelID = '1225114686391849110'; // Channel ID where the report should be sent
    const reportChannel = interaction.guild.channels.cache.get(channelID);

    const embed = new MessageEmbed()
      .setColor('#ff0000')
      .setTitle('🚨 Report')
      .setDescription(`Reported User: ${reportedUser}\nMinecraft IGN: ${minecraftIGN}\nReason: ${reason}`)
      .setFooter(`Reported by ${interaction.user.tag}`, interaction.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    try {
      await reportChannel.send({ embeds: [embed] });
      await interaction.reply({ content: 'Report sent successfully!', ephemeral: true });
    } catch (error) {
      console.error('Error sending report:', error);
      await interaction.reply({ content: 'Error sending report. Please try again later.', ephemeral: true });
    }
  },
};

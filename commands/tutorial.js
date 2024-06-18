const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Send a predefined embed message to a specific channel.')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to send the embed message.')),
  category: 'Utility',

  async execute(interaction) {
    const channelOption = interaction.options.getChannel('channel');

    // Check if the channel option is provided
    if (!channelOption) {
      return interaction.reply({ content: 'Please specify a channel.', ephemeral: true });
    }

    // Create the embed for the tutorial message
    const embed = new MessageEmbed()
      .setColor(config.color.default)
      .setTitle('How to Test Your Tier')
      .setDescription('Follow these steps to test your tier:')
      .addFields(
        { name: '1. Join the Queue', value: 'Join the queue to enter the waiting list.', inline: false },
        { name: 'Command:', value: '`/queue join`', inline: false },
        { name: '2. Leave the Queue', value: 'Type `/queue leave` to leave the current queue.', inline: false },
        { name: '3. Open Your Ticket', value: 'When you are in position #1, execute `/queue open` to open your tier test ticket.', inline: false },
        { name: 'Commands:', value: '• To join queue: `/queue join`\n• To leave queue: `/queue leave`\n• To open tier test ticket: `/queue open`', inline: false },
        { name: 'Important:', value: `Make sure to execute these commands in <#1205522441036894208>.`, inline: false }
      )
      .setFooter('For further assistance, contact support.')
      .setTimestamp();

    try {
      // Fetch the channel to send the message
      const channelToSend = await interaction.client.channels.fetch(channelOption.id);

      // Send the embed message to the specified channel
      await channelToSend.send({ embeds: [embed] });

      return interaction.reply({ content: 'Embed message sent successfully.', ephemeral: true });
    } catch (error) {
      console.error('Error sending embed message:', error);
      return interaction.reply({ content: 'Failed to send embed message.', ephemeral: true });
    }
  },
};
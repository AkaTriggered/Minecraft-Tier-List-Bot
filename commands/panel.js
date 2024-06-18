const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('panel')
        .setDescription('Manage tickets using buttons.')
        .addChannelOption(option => option.setName('channel').setDescription('The channel to send the panel.')),
    category: 'Utility',

    async execute(interaction) {
        const channelOption = interaction.options.getChannel('channel');
        
        if (!channelOption || channelOption.type !== 'GUILD_TEXT') {
            return interaction.reply({ content: 'Please provide a valid text channel.', ephemeral: true });
        }

        const joinButton = new MessageButton()
            .setCustomId('join')
            .setLabel('Join Queue')
            .setStyle('PRIMARY');

        const leaveButton = new MessageButton()
            .setCustomId('leave')
            .setLabel('Leave Queue')
            .setStyle('DANGER');

        const openTicketButton = new MessageButton()
            .setCustomId('open')
            .setLabel('Open Ticket')
            .setStyle('SECONDARY');

        const row = new MessageActionRow()
            .addComponents(joinButton, leaveButton, openTicketButton);

        try {
            // Send the button panel to the mentioned channel
            await channelOption.send({ content: 'Ticket Management Panel:', components: [row] });
            await interaction.reply({ content: 'Ticket Management Panel sent to the specified channel.', ephemeral: true });
        } catch (error) {
            console.error('Error sending the button panel:', error);
            return interaction.reply({ content: 'Failed to send the button panel to the specified channel.', ephemeral: true });
        }
    }
};

const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removemessage')
        .setDescription('Remove a message by its ID.')
        .addStringOption(option => 
            option.setName('message_id')
                .setDescription('The ID of the message to remove.')
                .setRequired(true)),
    category: 'Moderation',

    async execute(interaction) {
        // Check if the user has the tester role
        const testerRoleId = '1210300053235966002'; // Replace this with the ID of the tester role
        if (!interaction.member.roles.cache.has(testerRoleId)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const messageId = interaction.options.getString('message_id');

        try {
            // Fetch the message by its ID
            const message = await interaction.channel.messages.fetch(messageId);

            // Delete the message
            await message.delete();
            
            await interaction.reply({ content: 'Message removed successfully.', ephemeral: true });
        } catch (error) {
            console.error('Error removing message:', error);
            await interaction.reply({ content: 'Failed to remove message. Make sure the provided message ID is valid and accessible.', ephemeral: true });
        }
    },
};

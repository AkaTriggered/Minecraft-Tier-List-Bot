const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deletemessages')
        .setDescription('Delete all messages in a channel.')
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('The channel to delete messages from.')
                .setRequired(true)),
    category: 'Utility',

    async execute(interaction) {
        // Check if the user has the tester role
        const testerRoleId = '1210300053235966002'; // Replace this with the ID of the tester role
        if (!interaction.member.roles.cache.has(testerRoleId)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const channel = interaction.options.getChannel('channel');

        try {
            // Fetch the messages in the channel
            const messages = await channel.messages.fetch();

            // Delete each message
            messages.forEach(async message => {
                await message.delete().catch(error => console.error('Error deleting message:', error));
            });

            await interaction.reply({ content: 'All messages deleted successfully.', ephemeral: true });
        } catch (error) {
            console.error('Error deleting messages:', error);
            await interaction.reply({ content: 'Failed to delete messages. Make sure the provided channel is valid and accessible.', ephemeral: true });
        }
    },
};

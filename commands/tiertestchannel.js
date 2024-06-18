const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createchannel')
        .setDescription('Create a channel with specific permissions.')
        .addStringOption(option => 
            option.setName('channel_name')
                .setDescription('Name of the channel.')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('category')
                .setDescription('Category where the channel should be created.')
                .setRequired(true)),
    async execute(interaction) {
        const userId = '1063691309782675566'; // Replace with the specific user ID
        const allowedRole = 'everyone'; // Role to allow viewing the channel
        const guild = interaction.guild;
        const channelName = interaction.options.getString('channel_name');
        const categoryId = interaction.options.getString('category');

        // Check if the user is allowed to use this command
        if (interaction.user.id !== userId) {
            return interaction.reply({ content: 'You are not allowed to use this command.', ephemeral: true });
        }

        // Find the category by ID
        const category = guild.channels.cache.get(categoryId);
        if (!category || category.type !== 'GUILD_CATEGORY') {
            return interaction.reply({ content: 'Invalid category ID.', ephemeral: true });
        }

        try {
            const channel = await guild.channels.create(channelName, {
                type: 'GUILD_TEXT',
                parent: categoryId,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone,
                        allow: ['VIEW_CHANNEL'],
                        deny: ['SEND_MESSAGES']
                    }
                ]
            });

            const embed = new MessageEmbed()
                .setColor(config.color.default)
                .setTitle('Channel Created')
                .setDescription(`Channel ${channel} has been created under ${category} with the specified permissions.`)
                .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true, size: 64 }));

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error('Error creating channel:', error);
            await interaction.reply({ content: 'Failed to create the channel.', ephemeral: true });
        }
    },
};

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const config = require('../config.json');
const fs = require('fs').promises;
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('results')
        .setDescription('Tier test results.')
        .addUserOption(option => option.setName('username').setDescription('The Discord user to report the results for.').setRequired(true))
        .addStringOption(option => option.setName('minecraft_ign').setDescription('The Minecraft IGN of the user.').setRequired(true))
        .addStringOption(option => option.setName('previous_rank').setDescription('The previous rank of the user.').setRequired(true))
        .addStringOption(option => option.setName('rank_earned').setDescription('The rank earned by the user.').setRequired(true))
        .addUserOption(option => option.setName('tester').setDescription('The name of the tester.').setRequired(true))
        .addStringOption(option => option.setName('gamemode').setDescription('The game mode of the test.').setRequired(true))
        .addStringOption(option => option.setName('region').setDescription('The region of the user.').setRequired(true)),
    category: 'Information',

    async execute(interaction) {
        // Defer the reply
        await interaction.deferReply({ ephemeral: true });

        // Check if the user has the tester role
        const member = interaction.member;
        const testerRole = config.testerRoleId; // ID of the tester role
        if (!member.roles.cache.has(testerRole)) {
            await interaction.followUp({ content: 'You do not have permission to execute this command.', ephemeral: true });
            return;
        }

        const minecraftIGN = interaction.options.getString('minecraft_ign');
        const previousRank = interaction.options.getString('previous_rank').toUpperCase(); // Capitalize previous rank
        const rankEarned = interaction.options.getString('rank_earned').toUpperCase(); // Capitalize rank earned
        const tester = interaction.options.getUser('tester');
        const gamemode = interaction.options.getString('gamemode');
        const region = interaction.options.getString('region');
        const discordUser = interaction.options.getUser('username'); // Discord user to report results for

        // Use Crafty Avatar API for thumbnail
        const avatarUrl = `https://render.crafty.gg/3d/bust/${minecraftIGN}`;

        // Construct the embed
        const embed = new MessageEmbed()
            .setColor('#3498db')
            .setTitle(`${minecraftIGN}'s Test Results 🏆`)
            .addFields(
                { name: 'Tester', value: `<@${tester.id}>` },
                { name: 'Username', value: minecraftIGN },
                { name: 'Game Mode', value: gamemode },
                { name: 'Previous Rank', value: previousRank },
                { name: 'Rank Earned', value: rankEarned },
                { name: 'Region', value: region }
            )
            .setThumbnail(avatarUrl);

        // Determine file name format based on tier and game mode
        let filename;
        if (gamemode.toLowerCase().includes('crystal')) {
            if (rankEarned.toLowerCase().includes('low tier')) {
                filename = `vanilla_low${rankEarned.slice(-1)}.txt`;
            } else if (rankEarned.toLowerCase().includes('high tier')) {
                const tierNumber = rankEarned.toLowerCase().replace('high tier ', '');
                filename = `vanilla_${tierNumber}.txt`;
            }
        } else {
            let gamemodeFilename = '';
            if (gamemode.toLowerCase().includes('sword')) {
                gamemodeFilename = 'sword';
            } else if (gamemode.toLowerCase().includes('smp')) {
                gamemodeFilename = 'smp';
            } else if (gamemode.toLowerCase().includes('uhc')) {
                gamemodeFilename = 'uhc';
            } else if (gamemode.toLowerCase().includes('nethpot')) {
                gamemodeFilename = 'nethpot';
            }

            if (rankEarned.toLowerCase().includes('low tier')) {
                filename = `${gamemodeFilename}_low${rankEarned.slice(-1)}.txt`;
            } else if (rankEarned.toLowerCase().includes('high tier')) {
                const tierNumber = rankEarned.toLowerCase().replace('high tier ', '');
                filename = `${gamemodeFilename}_${tierNumber}.txt`;
            }
        }

        // Write username to file and send message if filename is defined
        if (filename) {
    const filePath = path.join(__dirname, '..', 'public', filename);
    try {
        await fs.appendFile(filePath, `${minecraftIGN}\n`);
        await interaction.followUp({ content: `Test results for ${minecraftIGN} have been posted to ${filename}.`, ephemeral: true });
    } catch (error) {
        console.error('Error writing to file:', error);
        await interaction.followUp({ content: 'Failed to write test results to file.', ephemeral: true });
    }
}

        // Send the embed to the specified channel
        const channel = interaction.client.channels.cache.get('1230844230956744704');
        if (!channel) {
            console.error('Channel not found.');
            await interaction.followUp({ content: 'Failed to find the specified channel.', ephemeral: true });
            return;
        }

        await channel.send({ content: `<@${discordUser.id}>`, embeds: [embed] });
    },
};
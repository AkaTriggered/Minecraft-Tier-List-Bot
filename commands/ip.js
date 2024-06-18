const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ip')
        .setDescription('Display the server IP and port.'),
    category: 'Server',

    async execute(interaction) {
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Server IP & Port')
            .setDescription('Here is the IP and port to connect to our server:')
            .addFields(
                { name: 'IP', value: 'PLAY.TOTEMMC.FUN' },
                { name: 'PORT', value: '49015' }
            )
            .setImage('https://media.discordapp.net/attachments/1205520452626284604/1208017917606756432/image.png?ex=6619205b&is=6606ab5b&hm=3e6a4701b7a5627992749011&=&format=webp&quality=lossless&width=550&height=105');

        await interaction.reply({ embeds: [embed] });
    },
};


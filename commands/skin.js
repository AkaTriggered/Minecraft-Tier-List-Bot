const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton, MessageAttachment } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skin')
    .setDescription('Download Minecraft skin by username.')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('The Minecraft username to fetch the skin for.')
        .setRequired(true)),
  category: 'Fun',

  async execute(interaction) {
    const username = interaction.options.getString('username');

    try {
      // Make a request to Mojang API to get the UUID of the player
      const uuidResponse = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${username}`);

      if (!uuidResponse.data || uuidResponse.data.errorMessage) {
        // Handle case where the username was not found or there's an error message
        const errorEmbed = new MessageEmbed()
          .setColor('#FF0000')
          .setDescription(`Username **${username}** not found.`);
        await interaction.reply({ embeds: [errorEmbed] });
        return;
      }

      const uuid = uuidResponse.data.id;

      // Get the skin texture from Crafatar API
      const skinResponse = await axios.get(`https://crafatar.com/renders/body/${uuid}`);
      const skinUrl = skinResponse.request.res.responseUrl;

      // Create a download button
      const downloadButton = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setURL(skinUrl)
            .setLabel('Download Skin')
            .setStyle('LINK')
        );

      // Create a MessageAttachment for the skin
      const skinAttachment = new MessageAttachment(skinUrl, `${username}_skin.png`);

      // Create an embed to display the skin
      const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`${username}'s Minecraft Skin`)
        .setDescription(`**Username: ${username}**`)
        .setImage('attachment://skin.png') // Reference the attachment using its name
        .setFooter('Skin provided by AkaServices');

      // Add the image to the embed as a thumbnail
      embed.setThumbnail(skinUrl);

      await interaction.reply({ embeds: [embed], files: [skinAttachment], components: [downloadButton] });
    } catch (error) {
      console.error('Error fetching skin:', error);

      if (error.response && error.response.status === 404) {
        // Handle 404 error when the skin is not found
        const errorEmbed = new MessageEmbed()
          .setColor('#FF0000')
          .setDescription(`Skin for **${username}** not found.`);
        await interaction.reply({ embeds: [errorEmbed] });
      } else {
        // Handle other errors
        const errorEmbed = new MessageEmbed()
          .setColor('#FF0000')
          .setDescription('An error occurred while fetching the skin. Please Check the Username or try again later.');
        await interaction.reply({ embeds: [errorEmbed] });
      }
    }
  },
};

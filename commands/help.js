const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Get help with commands.'),
  category: 'Information',

  async execute(interaction) {
    const embed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Help Menu')
      .setDescription('Here are some commands you can use:')
      .addFields(
        { name: '**/queue open**', value: 'Opens a Ticket For #1 Queue User :ticket:' },
        { name: '**/queue join**', value: 'Joins the queue for Tier Testing :busts_in_silhouette:' },
        { name: '**/ping**', value: 'Check the bot\'s latency to Discord. :ping_pong:' },
        { name: '**/skin <username>**', value: 'Get the Minecraft skin of the specified username. :joystick:' },
      )
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setTimestamp()
      .setFooter('Bot developed by AkaTriggered with Node.js', 'https://th.bing.com/th/id/OIP.dNWTURYUbsqAyebvO3JHowHaDL?w=336&h=150&c=7&r=0&o=5&pid=1.7');

    await interaction.reply({ embeds: [embed] });
  },
};

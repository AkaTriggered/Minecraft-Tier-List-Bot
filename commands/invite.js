const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const config = require('../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Get an invite link for the bot.')
		.addStringOption(option =>
			option.setName('permissions')
				.setDescription('Specify permissions for the bot invite (optional).')
				.setRequired(true)), // Set the 'permissions' option as required

	category: 'Utility', // Change this to the appropriate category

	async execute(interaction) {
		// Get the permissions specified by the user
		const permissions = interaction.options.getString('permissions');

		// Construct the invite link with your bot's client ID and the specified permissions
		const inviteLink = `https://discord.com/oauth2/authorize?client_id=${interaction.client.user.id}&scope=bot&permissions=${permissions}`;

		const inviteEmbed = new MessageEmbed()
			.setColor(config.color.default)
			.setTitle('Bot Invite Link')
			.setDescription(`You can invite the bot to your server using the following link:`)
			.setFooter(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true, size: 64 }))
			.setTimestamp();

		// Create a button with the invite link
		const inviteButton = new MessageButton()
			.setURL(inviteLink)
			.setLabel('Invite Bot')
			.setStyle('LINK');

		// Create an action row to contain the button
		const row = new MessageActionRow().addComponents(inviteButton);

		await interaction.reply({ embeds: [inviteEmbed], components: [row] });
	},
};

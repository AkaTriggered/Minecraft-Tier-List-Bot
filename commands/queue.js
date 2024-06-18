const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const config = require('../config.json');
const { MongoClient } = require('mongodb');

let queue = [];
let queueMessage = null;
let queueEnabled = true;

const mongoURI = "mongodb+srv://killerboy99126:Anupam1!@cluster0.lbtxinl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const mongoClient = new MongoClient(mongoURI);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Manage the queue system.')
        .addSubcommand(subcommand => subcommand.setName('join').setDescription('Join the queue to be added to a position.'))
        .addSubcommand(subcommand => subcommand.setName('leave').setDescription('Leave the queue.'))
        .addSubcommand(subcommand => subcommand.setName('open').setDescription('Open a ticket for the next user in the queue.'))
        .addSubcommand(subcommand => subcommand.setName('close').setDescription('Close the ticket.')
            .addChannelOption(option => option.setName('channel').setDescription('The ticket channel to close.')))
        .addSubcommand(subcommand => subcommand.setName('ticketopen').setDescription('Manually open a ticket for a user from the queue.')
            .addUserOption(option => option.setName('user').setDescription('The user to open the ticket for.')))
        .addSubcommand(subcommand => subcommand.setName('massclose').setDescription('Close all open tickets.'))
        .addSubcommand(subcommand => subcommand.setName('ticketlist').setDescription('List all open tickets for tier testers.'))
        .addSubcommand(subcommand => subcommand.setName('adduser').setDescription('Add a user to an existing ticket.')
            .addUserOption(option => option.setName('user').setDescription('The user to add to the ticket.'))
            .addChannelOption(option => option.setName('channel').setDescription('The ticket channel to add the user to.')))
        .addSubcommand(subcommand => subcommand.setName('removeuser').setDescription('Remove a user from an existing ticket.')
            .addUserOption(option => option.setName('user').setDescription('The user to remove from the ticket.'))
            .addChannelOption(option => option.setName('channel').setDescription('The ticket channel to remove the user from.')))
        .addSubcommand(subcommand => subcommand.setName('massopen').setDescription('Open all tickets from the queue list.')),
    category: 'Utility',

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'join':
                return joinQueue(interaction);
            case 'leave':
                return leaveQueue(interaction);
            case 'open':
                if (!interaction.member.roles.cache.has('1210300053235966002')) {
                    return interaction.reply({ content: 'Only Tier Testers Can Use This Command.', ephemeral: true });
                }
                return openTicket(interaction);
            case 'close':
                if (!interaction.member.roles.cache.has('1210300053235966002')) {
                    return interaction.reply({ content: 'Only Tier Testers Can Use This Command.', ephemeral: true });
                }
                return closeTicket(interaction);
            case 'ticketopen':
                if (!interaction.member.roles.cache.has('1210300053235966002')) {
                    return interaction.reply({ content: 'Only Tier Testers Can Use This Command.', ephemeral: true });
                }
                return ticketOpen(interaction);
            case 'massclose':
                if (!interaction.member.roles.cache.has('1210300053235966002')) {
                    return interaction.reply({ content: 'Only Tier Testers Can Use This Command.', ephemeral: true });
                }
                return massCloseTickets(interaction);
            case 'ticketlist':
                if (!interaction.member.roles.cache.has('1210300053235966002')) {
                    return interaction.reply({ content: 'Only Tier Testers Can Use This Command.', ephemeral: true });
                }
                return ticketList(interaction);
            case 'adduser':
                if (!interaction.member.roles.cache.has('1210300053235966002')) {
                    return interaction.reply({ content: 'Only Tier Testers Can Use This Command.', ephemeral: true });
                }
                return addUserToTicket(interaction);
            case 'massopen':
    if (!interaction.member.roles.cache.has('1210300053235966002')) {
        return interaction.reply({ content: 'Only Tier Testers Can Use This Command.', ephemeral: true });
    }
               return massOpenTickets(interaction);
            case 'removeuser':
                if (!interaction.member.roles.cache.has('1210300053235966002')) {
                    return interaction.reply({ content: 'Only Tier Testers Can Use This Command.', ephemeral: true });
                }
                return removeUserFromTicket(interaction);
            default:
                return interaction.reply({ content: 'Invalid subcommand.', ephemeral: true });
        }
    },
};

async function connectToMongo() {
    try {
        await mongoClient.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

connectToMongo();

async function joinQueue(interaction) {
    if (!queueEnabled) {
        return interaction.reply({ content: 'The queue system is currently disabled.', ephemeral: true });
    }

    const db = mongoClient.db("tickets");
    const queueCollection = db.collection("queue");

    const userInQueue = await queueCollection.findOne({ userId: interaction.user.id });

    if (userInQueue) {
        return interaction.reply({ content: 'You are already in the queue.', ephemeral: true });
    }

    await queueCollection.insertOne({ userId: interaction.user.id });
    queue.push(interaction.user.id);
    sendQueueStatus(interaction.client);
    const position = queue.length;

    const positionEmbed = new MessageEmbed()
        .setColor(config.color.default)
        .setTitle('Queue Position')
        .setDescription(`You have been added to the queue. Your position is **#${position}**.`)
        .setFooter(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true, size: 64 }))
        .setTimestamp()
        .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true, size: 64 }));

    await interaction.reply({ embeds: [positionEmbed], ephemeral: true });

    const queueChannelId = '1230844021149270097';
    const queueChannel = await interaction.client.channels.fetch(queueChannelId);

    if (queueChannel && queueChannel.isText() && queueMessage) {
        const queueList = queue.map((userId, index) => `#${index + 1} - <@${userId}>`).join('\n');
        const embed = new MessageEmbed()
            .setColor(config.color.default)
            .setTitle('Users Waiting List')
            .setDescription(queueList)
            .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true, size: 64 }));

        queueMessage.edit({ embeds: [embed] });
    }
}

async function leaveQueue(interaction) {
    const db = mongoClient.db("tickets");
    const queueCollection = db.collection("queue");

    const result = await queueCollection.deleteOne({ userId: interaction.user.id });

    if (result.deletedCount === 0) {
        return interaction.reply({ content: 'You are not in the queue.', ephemeral: true });
    }

    const index = queue.indexOf(interaction.user.id);
    if (index !== -1) {
        queue.splice(index, 1);
        sendQueueStatus(interaction.client);
        await interaction.reply({ content: 'You have left the queue.', ephemeral: true });
    }
}

async function openTicket(interaction) {
    const userRoles = interaction.member.roles;
    const testerRoleId = config.testerRoleId;
    const categoryId = '1223634241338998877';

    if (!userRoles.cache.has(testerRoleId) && !queue.includes(interaction.user.id)) {
        return interaction.reply({ content: 'You are not eligible to open a ticket. Please join the queue first.', ephemeral: true });
    }

    const guild = interaction.guild;
    const category = guild.channels.cache.get(categoryId);

    if (!category || category.type !== 'GUILD_CATEGORY') {
        return interaction.reply({ content: 'Invalid category ID.', ephemeral: true });
    }

    const ticketChannel = await createTicketChannel(interaction.user, guild, categoryId);
    if (ticketChannel) {
        const testerRoleMention = `<@&${testerRoleId}>`;

        const ticketMessageEmbed = new MessageEmbed()
            .setColor(config.color.default)
            .setTitle('Ticket Opened')
            .setDescription(`Hey ${interaction.user.username}, your ticket has been created in ${ticketChannel}. Please wait for ${testerRoleMention} to assist you.`)
            .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true, size: 64 }));

        await interaction.reply({ embeds: [ticketMessageEmbed], ephemeral: true });

        await ticketChannel.send(`Hey ${interaction.user.username}, please wait for ${testerRoleMention} to respond on the ticket.`);

        queue.shift();
        sendQueueStatus(interaction.client);
    } else {
        await interaction.reply({ content: 'Failed to create the ticket channel.', ephemeral: true });
    }
}

async function ticketOpen(interaction) {
    const userToOpen = interaction.options.getUser('user');
    const testerRoleId = config.testerRoleId;

    if (!interaction.member.roles.cache.has(testerRoleId)) {
        return interaction.reply({ content: 'Only users with the tester role can manually open tickets.', ephemeral: true });
    }

    const guild = interaction.guild;
    const categoryId = '1223634241338998877';
    
    const ticketChannel = await createTicketChannel(userToOpen, guild, categoryId);
    
    if (ticketChannel) {
        const testerRoleMention = `<@&${testerRoleId}>`;

        const ticketMessageEmbed = new MessageEmbed()
            .setColor(config.color.default)
            .setTitle('Ticket Opened')
            .setDescription(`Ticket has been manually opened for ${userToOpen.username} in ${ticketChannel}. Please wait for ${testerRoleMention} to assist.`)
            .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true, size: 64 }));

        await interaction.reply({ embeds: [ticketMessageEmbed], ephemeral: true });

        await ticketChannel.send(`Hey ${userToOpen.username}, please wait for ${testerRoleMention} to respond on the ticket.`);
        const db = mongoClient.db("tickets");
        const queueCollection = db.collection("queue");
        const result = await queueCollection.deleteOne({ userId: userToOpen.id });
        if (result.deletedCount !== 0) {
            sendQueueStatus(interaction.client);
        }
    } else {
        await interaction.reply({ content: 'Failed to create the ticket channel.', ephemeral: true });
    }
}

async function closeTicket(interaction) {
    const channelOption = interaction.options.getChannel('channel');
    const testerRoleId = config.testerRoleId;
    const guild = interaction.guild;

    let channelToDelete;

    if (channelOption) {
        channelToDelete = channelOption;
    } else {
        return interaction.reply({ content: 'Please mention a channel to close.', ephemeral: true });
    }

    if (!interaction.member.roles.cache.has(testerRoleId)) {
        return interaction.reply({ content: 'You do not have permission to close tickets.', ephemeral: true });
    }

    const db = mongoClient.db("tickets");
    const ticketsCollection = db.collection("opened_tickets");
    
    const ticket = await ticketsCollection.findOne({ channelId: channelToDelete.id, guildId: guild.id });

    if (ticket) {
        try {
            await channelToDelete.delete();
            await ticketsCollection.deleteOne({ channelId: channelToDelete.id });
            await interaction.reply({ content: `Channel ${channelToDelete.name} has been closed.`, ephemeral: true });
        } catch (error) {
            console.error('Error closing channel:', error);
            return interaction.reply({ content: 'Failed to close the channel.', ephemeral: true });
        }
    } else {
        return interaction.reply({ content: 'The specified channel is not a valid ticket.', ephemeral: true });
    }
}

async function massCloseTickets(interaction) {
    const testerRoleId = config.testerRoleId;
    const guild = interaction.guild;
    const db = mongoClient.db("tickets");
    const ticketsCollection = db.collection("opened_tickets");

    if (!interaction.member.roles.cache.has(testerRoleId)) {
        return interaction.reply({ content: 'Only users with the tester role can close tickets.', ephemeral: true });
    }

    // Fetch all open tickets
    const tickets = await ticketsCollection.find({ guildId: guild.id }).toArray();

    // Close each ticket
    for (const ticket of tickets) {
        const channel = guild.channels.cache.get(ticket.channelId);

        if (channel && channel.type === 'GUILD_TEXT') {
            try {
                // Delete channel
                await channel.delete();

                // Remove ticket from MongoDB
                await ticketsCollection.deleteOne({ channelId: ticket.channelId });
            } catch (error) {
                console.error(`Error closing ticket ${ticket.channelId}:`, error);
            }
        }
    }

    await interaction.reply({ content: 'Closed all open tickets.', ephemeral: true });
}

async function ticketList(interaction) {
    const testerRoleId = config.testerRoleId;
    const guild = interaction.guild;

    if (!interaction.member.roles.cache.has(testerRoleId)) {
        return interaction.reply({ content: 'Only users with the tester role can view the ticket list.', ephemeral: true });
    }

    const db = mongoClient.db("tickets");
    const ticketsCollection = db.collection("opened_tickets");
    const tickets = await ticketsCollection.find({ guildId: guild.id }).toArray();

    if (tickets.length === 0) {
        return interaction.reply({ content: 'No open tickets found.', ephemeral: true });
    }

    const ticketListEmbed = new MessageEmbed()
        .setColor(config.color.default)
        .setTitle('Open Tickets')
        .setDescription(tickets.map(ticket => `<@${ticket.userId}> - <#${ticket.channelId}>`).join('\n'))
        .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true, size: 64 }));

    await interaction.reply({ embeds: [ticketListEmbed], ephemeral: true });
}
async function massOpenTickets(interaction) {
    const testerRoleId = '1210300053235966002'; // Replace with your tester role ID
    const guild = interaction.guild;
    const categoryId = '1223634241338998877'; // Replace with your category ID
    const db = mongoClient.db("tickets");
    const queueCollection = db.collection("queue");
    const ticketsCollection = db.collection("opened_tickets");

    if (!interaction.member.roles.cache.has(testerRoleId)) {
        return interaction.reply({ content: 'Only Tier Testers Can Use This Command.', ephemeral: true });
    }

    try {
        const queueUsers = await queueCollection.find({}).toArray();

        for (const queueUser of queueUsers) {
            const user = await guild.members.fetch(queueUser.userId);

            if (user) {
                const ticketChannel = await createTicketChannel(user.user, guild, categoryId);

                if (ticketChannel) {
                    await ticketsCollection.insertOne({ userId: user.user.id, channelId: ticketChannel.id, guildId: guild.id });
                    await queueCollection.deleteOne({ userId: user.user.id });
                }
            }
        }

        return interaction.reply({ content: 'All tickets from the queue list have been opened.', ephemeral: true });
    } catch (error) {
        console.error('Error opening tickets:', error);
        return interaction.reply({ content: 'Failed to open tickets.', ephemeral: true });
    }
}
async function sendQueueStatus(client) {
    const queueChannelId = '1230844021149270097';
    const queueChannel = await client.channels.fetch(queueChannelId);

    if (!queueChannel.isText()) return;

    const queueList = queue.map((userId, index) => `#${index + 1} - <@${userId}>`).join('\n');

    const embed = new MessageEmbed()
        .setColor(config.color.default)
        .setTitle('Users Waiting List')
        .setDescription(queueList)
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 64 }));

    if (!queueMessage) {
        queueMessage = await queueChannel.send({ embeds: [embed] });
    } else {
        queueMessage.edit({ embeds: [embed] });
    }
}

async function createTicketChannel(user, guild, categoryId) {
    const userName = user.username;
    const channelName = `ticket-${userName}`;
    const testerRoleId = config.testerRoleId;
    
    try {
        const channel = await guild.channels.create(channelName, {
            type: 'GUILD_TEXT',
            parent: categoryId,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone,
                    deny: ['VIEW_CHANNEL']
                },
                {
                    id: user.id,
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
                },
                {
                    id: testerRoleId,
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
                }
            ]
        });

        const db = mongoClient.db("tickets");
        const ticketsCollection = db.collection("opened_tickets");
        await ticketsCollection.insertOne({ userId: user.id, channelId: channel.id, guildId: guild.id });

        return channel;
    } catch (error) {
        console.error('Error creating ticket channel:', error);
        return null;
    }
}

async function addUserToTicket(interaction) {
    const userToAdd = interaction.options.getUser('user');
    const channelOption = interaction.options.getChannel('channel');

    if (!userToAdd || !channelOption) {
        return interaction.reply({ content: 'Please provide both a user and a channel.', ephemeral: true });
    }

    const guild = interaction.guild;

    const channel = guild.channels.cache.get(channelOption.id);

    if (!channel) {
        return interaction.reply({ content: 'Invalid channel.', ephemeral: true });
    }

    const testerRoleId = config.testerRoleId;

    if (!interaction.member.roles.cache.has(testerRoleId)) {
        return interaction.reply({ content: 'You do not have permission to add users to tickets.', ephemeral: true });
    }

    try {
        await channel.permissionOverwrites.create(userToAdd.id, {
            VIEW_CHANNEL: true,
            SEND_MESSAGES: true
        });

        return interaction.reply({ content: `Added ${userToAdd.username} to ${channel.name}.`, ephemeral: true });
    } catch (error) {
        console.error('Error adding user to ticket:', error);
        return interaction.reply({ content: 'Failed to add user to the ticket.', ephemeral: true });
    }
}

async function removeUserFromTicket(interaction) {
    const userToRemove = interaction.options.getUser('user');
    const channelOption = interaction.options.getChannel('channel');

    if (!userToRemove || !channelOption) {
        return interaction.reply({ content: 'Please provide both a user and a channel.', ephemeral: true });
    }

    const guild = interaction.guild;

    const channel = guild.channels.cache.get(channelOption.id);

    if (!channel) {
        return interaction.reply({ content: 'Invalid channel.', ephemeral: true });
    }

    const testerRoleId = config.testerRoleId;

    if (!interaction.member.roles.cache.has(testerRoleId)) {
        return interaction.reply({ content: 'You do not have permission to remove users from tickets.', ephemeral: true });
    }

    try {
        await channel.permissionOverwrites.delete(userToRemove.id);

        return interaction.reply({ content: `Removed ${userToRemove.username} from ${channel.name}.`, ephemeral: true });
    } catch (error) {
        console.error('Error removing user from ticket:', error);
        return interaction.reply({ content: 'Failed to remove user from the ticket.', ephemeral: true });
    }
}

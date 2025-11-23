// ticket-setup.js - Command to create ticket panel
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionsBitField, ChannelType, Colors, MessageFlags } = require('discord.js');
const config = require('../config.json');
const Logger = require('../logger');

const logger = new Logger(config.log_channel_id);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-setup')
        .setDescription('Sends the ticket creation message to this channel.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel where the ticket creation message should be sent.')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        const channel = interaction.options.getChannel('channel');

        const setupEmbed = new EmbedBuilder()
            .setTitle(config.ticket_embed.title || 'Support Ticket')
            .setDescription(config.ticket_embed.description || 'Please select a reason for opening a ticket from the menu below.')
            .setColor(config.ticket_embed.color || Colors.Blue)
            .setFooter({ text: `${interaction.guild.name} | Server Support` });

        const serverIcon = interaction.guild.iconURL({ dynamic: true, size: 512 });
        if (serverIcon) {
            setupEmbed.setThumbnail(serverIcon);
        }

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('create_ticket_menu')
            .setPlaceholder('Select a reason to create a ticket...')
            .addOptions(config.ticket_options.map(option => ({
                label: option.label,
                description: option.description,
                value: option.value,
                emoji: option.emoji,
            })));

        const row = new ActionRowBuilder().addComponents(selectMenu);

        try {
            await channel.send({ embeds: [setupEmbed], components: [row] });

            await interaction.editReply({ content: `The ticket creation message was successfully sent to channel ${channel}.` });
            
            // Log setup command
            await logger.setupExecuted(interaction.client, channel, interaction.user);

        } catch (error) {
            console.error(error);
            await logger.error(interaction.client, 'Setup Command Error', error.message, `Channel: ${channel.name}`);
            await interaction.editReply({ content: 'An error occurred while sending the message.' });
        }
    },
};

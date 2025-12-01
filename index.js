// index.js - Main bot file
const fs = require('node:fs');
const path = require('node:path');
const { 
    Client, Collection, GatewayIntentBits, Events, EmbedBuilder, 
    ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, 
    TextInputStyle, ChannelType, PermissionsBitField, ButtonBuilder, 
    ButtonStyle, Colors, AttachmentBuilder, ActivityType, MessageFlags
} = require('discord.js');
const discordTranscripts = require('discord-html-transcripts');
const autoClose = require('./autoClose'); // Import autoClose module
const ticketCategoryManager = require('./ticketCategoryManager');
const Logger = require('./logger'); // Import Logger
const SecurityManager = require('./security'); // Import SecurityManager
const InputValidator = require('./inputValidator'); // Import InputValidator
const ErrorHandler = require('./errorHandler'); // Import ErrorHandler
const config = require('./config.json');

// Initialize logger
const logger = new Logger(config.log_channel_id);

// Initialize security manager
const security = new SecurityManager(config);

// Initialize error handler
const errorHandler = new ErrorHandler(logger, security);

// Validate configuration on startup
const configValidation = InputValidator.validateConfig(config);
if (!configValidation.valid) {
    console.error('❌ Configuration validation failed:');
    configValidation.errors.forEach(error => console.error(`  - ${error}`));
    process.exit(1);
}

// Setup error handlers
errorHandler.setupUnhandledRejectionHandler(client);
errorHandler.setupUncaughtExceptionHandler(client);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Function to create error embed
function createErrorEmbed(message) {
    return new EmbedBuilder()
        .setColor(Colors.Red)
        .setTitle('❌ Error')
        .setDescription(message);
}

// Function to create success embed
function createSuccessEmbed(message) {
    return new EmbedBuilder()
        .setColor(Colors.Green)
        .setTitle('✅ Success')
        .setDescription(message);
}

// Function to create info embed
function createInfoEmbed(message, title = 'ℹ️ Information') {
    return new EmbedBuilder()
        .setColor(Colors.Blue)
        .setTitle(title)
        .setDescription(message);
}

// Load commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Bot ready event
client.once(Events.ClientReady, async (readyClient) => {
    console.log(`✅ Logged in as ${readyClient.user.tag}`);
    console.log(`💻 Bot is ready!`);
    
    // Log bot startup
    await logger.botStartup(readyClient, readyClient.user.tag);
    
    const updateStatus = () => {
        const guild = readyClient.guilds.cache.first();
        if (!guild) return console.log("❌ Guild not found.");

        const memberCount = guild.memberCount;

        // List of statuses
        const statuses = [
            //{ text: `your costum status here`, type: ActivityType.Watching },
            { text: `👀 ${memberCount} Members`, type: ActivityType.Watching } // Dynamic status
        ];

        // Select next status
        const status = statuses[index];
        readyClient.user.setActivity(status.text, { type: status.type });
        //console.log(`🌀 Status changed to: ${status.text}`);

        index = (index + 1) % statuses.length; // Move to next status
    };

    let index = 0;

    updateStatus(); // Initial execution
    setInterval(updateStatus, 5000); // Change status every 5 seconds

    // Message creation event in channel - optimized version
    client.on(Events.MessageCreate, async message => {
        if (message.author.bot) return;
        
        const channel = message.channel;
        
        // Quick channel type check first
        const isTicketChannel = channel.parentId === config.closed_ticket_category_id ||
                               ticketCategoryManager.isTicketCategory(channel.parent) ||
                               channel.parentId === config.ticket_category_id;
        
        if (isTicketChannel) {
            // Only do security checks for ticket channels
            const contentCheck = security.detectSuspiciousContent(message.content);
            if (contentCheck.suspicious) {
                await security.logSecurityEvent(client, 'Suspicious Content', 
                    `User: ${message.author.tag}\nChannel: ${message.channel.name}\nSuspicious score: ${contentCheck.score}`);
                // You can choose to delete the message or take other action
                return;
            }
            
            await autoClose.updateLastMessageTimestamp(channel);
        }
    });

    // Enable periodic check
    setInterval(() => autoClose.checkInactiveTickets(client), 60 * 60 * 1000);
    autoClose.checkInactiveTickets(client); // Immediate execution on startup

    // Clean up rate limits periodically
    setInterval(() => security.cleanupRateLimits(), 5 * 60 * 1000); // Every 5 minutes

    // Helper function to check admin role
    function isSupportAdmin(interaction) {
        return security.hasAdminPermission(interaction.member);
    }

    // Interaction listener
    client.on(Events.InteractionCreate, async interaction => {

        // Slash commands
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                await logger.error(readyClient, 'Command Not Found', `No command matching ${interaction.commandName} was found.`, `Guild: ${interaction.guild.name}`);
                return;
            }
            try {
                await command.execute(interaction);
                // Log command execution
                await logger.commandExecuted(readyClient, interaction.commandName, interaction.user, interaction.guild.name);
            } catch (error) {
                console.error(error);
                await logger.error(readyClient, 'Command Execution Error', error.message, `Command: ${interaction.commandName}`);

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', flags: [MessageFlags.Ephemeral] });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', flags: [MessageFlags.Ephemeral] });
                }
            }
            return;
        }

        // Selection menu
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'create_ticket_menu') {
                const selectedValue = interaction.values[0];
                const selectedOption = config.ticket_options.find(opt => opt.value === selectedValue);
                
                if (selectedOption && selectedOption.requiresReason) {
                    const modal = new ModalBuilder()
                        .setCustomId(`ticket_reason_modal_${selectedValue}`)
                        .setTitle(`📝 ${selectedOption.label}`)
                        .addComponents(
                            new ActionRowBuilder().addComponents(
                                new TextInputBuilder()
                                    .setCustomId('ticket_reason_input')
                                    .setLabel(`Please describe your ${selectedOption.label.toLowerCase()} in detail`)
                                    .setStyle(TextInputStyle.Paragraph)
                                    .setMinLength(10)
                                    .setMaxLength(1000)
                                    .setPlaceholder(`Please provide details about your ${selectedOption.label.toLowerCase()}...`)
                                    .setRequired(true)
                            )
                        );
                    await interaction.showModal(modal);
                } else {
                    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
                    await createTicketChannel(interaction, selectedValue);
                }
            }
            return;
        }

        // Modal submission
        if (interaction.isModalSubmit()) {
            // Handle ticket reason modals
            if (interaction.customId.startsWith('ticket_reason_modal_')) {
                await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
                const ticketType = interaction.customId.replace('ticket_reason_modal_', '');
                const reason = interaction.fields.getTextInputValue('ticket_reason_input');
                
                // Validate and sanitize reason
                const reasonValidation = InputValidator.validateTicketReason(reason);
                if (!reasonValidation.valid) {
                    return interaction.editReply({ content: `❌ ${reasonValidation.error}` });
                }
                
                await createTicketChannel(interaction, ticketType, reasonValidation.value);
            }

            // Modal for "Add User"
            if (interaction.customId === 'ticket_add_user_modal') {
                if (!isSupportAdmin(interaction)) {
                    return interaction.reply({ content: 'You are not allowed to do this.', flags: [MessageFlags.Ephemeral] });
                }
                await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
                const userId = interaction.fields.getTextInputValue('user_id_input');
                
                // Validate user ID
                const userIdValidation = InputValidator.validateUserId(userId);
                if (!userIdValidation.valid) {
                    return interaction.editReply({ content: `❌ ${userIdValidation.error}` });
                }
                
                const member = await interaction.guild.members.fetch(userIdValidation.value).catch(() => null);

                if (!member) {
                    return interaction.editReply({ content: 'User with this ID not found in the server.' });
                }

                try {
                    await interaction.channel.permissionOverwrites.edit(member.id, {
                        ViewChannel: true,
                        SendMessages: true,
                        ReadMessageHistory: true,
                        AttachFiles: true
                    });
                    await interaction.editReply({ content: `${member} has been successfully added to the ticket.` });
                    await interaction.channel.send({
                        embeds: [new EmbedBuilder().setColor(Colors.Blue).setDescription(`👤 ${member} was added to the ticket by ${interaction.user}.`)]
                    });
                } catch (error) {
                    console.error('Error adding user:', error);
                    await interaction.editReply({ content: 'An error occurred while adding the user.' });
                }
            }
            
            // Modal for "Remove User"
            if (interaction.customId === 'ticket_remove_user_modal') {
                 if (!isSupportAdmin(interaction)) {
                    return interaction.reply({ content: 'You are not allowed to do this.', flags: [MessageFlags.Ephemeral] });
                }
                await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
                const userId = interaction.fields.getTextInputValue('user_id_input');
                
                // Validate user ID
                const userIdValidation = InputValidator.validateUserId(userId);
                if (!userIdValidation.valid) {
                    return interaction.editReply({ content: `❌ ${userIdValidation.error}` });
                }
                
                const member = await interaction.guild.members.fetch(userIdValidation.value).catch(() => null);

                if (!member) {
                    return interaction.editReply({ content: 'User with this ID not found in the server.' });
                }

                // Check if the ticket creator is being removed
                const topic = interaction.channel.topic;
                if (topic && topic.includes(member.id)) {
                     return interaction.editReply({ content: 'You cannot remove the original ticket creator.' });
                }

                try {
                    await interaction.channel.permissionOverwrites.delete(member.id);
                    await interaction.editReply({ content: `${member} was successfully removed from the ticket.` });
                    await interaction.channel.send({
                        embeds: [new EmbedBuilder().setColor(Colors.Orange).setDescription(`👤 ${member} was removed from the ticket by ${interaction.user}.`)]
                    });
                } catch (error) {
                    console.error('Error removing user:', error);
                    await interaction.editReply({ content: 'An error occurred while removing the user.' });
                }
            }
            return;
        }

         // Button management
        if (interaction.isButton()) {
            const customId = interaction.customId;

            const isAdmin = isSupportAdmin(interaction);

            const topic = interaction.channel.topic;
            const userIdMatch = topic ? topic.match(/ID: (\d+)/) : null;
            const userId = userIdMatch ? userIdMatch[1] : null; 
            const isOwner = userId ? userId === interaction.user.id : false;

            // --- Claim Button --- (Admin only)
            if (customId === 'ticket_claim') {
                if (!isAdmin) {
                    return interaction.reply({ content: 'Only admins can claim tickets.', flags: [MessageFlags.Ephemeral] });
                }
                await interaction.deferUpdate(); 
                const originalEmbed = interaction.message.embeds[0];
                const updatedEmbed = EmbedBuilder.from(originalEmbed)
                    .addFields({ name: 'Claimed by', value: `${interaction.user}`, inline: true })
                    .setColor(Colors.Yellow); 
                const components = interaction.message.components[0].components.map(comp => {
                    if (comp.customId === 'ticket_claim') {
                        return ButtonBuilder.from(comp).setDisabled(true);
                    }
                    return ButtonBuilder.from(comp);
                });
                const updatedRow = new ActionRowBuilder().addComponents(components);
                await interaction.editReply({ embeds: [updatedEmbed], components: [updatedRow] });
                await interaction.channel.send({
                    embeds: [new EmbedBuilder().setColor(Colors.Yellow).setDescription(`This ticket was claimed by ${interaction.user}.`)]
                });
                // Log ticket claim
                const ticketOwner = interaction.guild.members.cache.get(userId);
                const typeMatch = interaction.channel.topic?.match(/Type: ([^|]+)/);
                const ticketType = typeMatch ? typeMatch[1].trim() : 'Unknown';
                await logger.ticketClaimed(readyClient, ticketOwner?.user || { id: userId }, ticketType, interaction.user);
            }

            // --- Close Button (Show confirmation) --- (Admin or ticket creator)
            if (customId === 'ticket_close') {
                if (!isAdmin && !isOwner) { 
                    return interaction.reply({ content: 'You do not have permission to close this ticket.', flags: [MessageFlags.Ephemeral] });
                }
                const confirmEmbed = new EmbedBuilder()
                    .setTitle('❓ Confirm Ticket Closure')
                    .setDescription('Are you sure you want to close this ticket?')
                    .setColor(Colors.Red);
                const confirmRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('ticket_close_confirm')
                        .setLabel('Yes, close')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('✔️'),
                    new ButtonBuilder()
                        .setCustomId('ticket_close_cancel')
                        .setLabel('Cancel')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('✖️')
                );
                await interaction.reply({ embeds: [confirmEmbed], components: [confirmRow], flags: [MessageFlags.Ephemeral] });
            }

            // --- Cancel Close Button ---
            if (customId === 'ticket_close_cancel') {
                await interaction.update({
                    content: '✖️ Ticket closing operation cancelled',
                    embeds: [], 
                    components: [] 
                            
               });
            setTimeout(async() =>
                 interaction.deleteReply(),
                       5000)
            }

            // --- Confirm Close Button ---
            if (customId === 'ticket_close_confirm') {
                if (!isAdmin && !isOwner) {
                    return interaction.update({ embeds: [createErrorEmbed('You do not have permission to perform this action.')], components: [] });
                }

                await interaction.update({ embeds: [createInfoEmbed('⏳ Closing and moving ticket ...', 'Closing Ticket')], components: [] });
                setTimeout(async() =>       
                     interaction.deleteReply(),
                             5000
                             )

                //  1. Get closed category ID from config.json
                const closedCategoryId = config.closed_ticket_category_id;
                if (!closedCategoryId) {
                     console.error("closed_ticket_category_id is not set in config.json!");
                     // Notify user of error (use followUp instead of previous edit)
                     return interaction.followUp({ embeds: [createErrorEmbed('Configuration error: Closed ticket category not defined.')], flags: [MessageFlags.Ephemeral] });
                }

                //  2. Find main panel message
                  const topic = interaction.channel.topic;
                  const panelMessageIdMatch = topic ? topic.match(/PanelMessageID: (\d+)/) : null;
                  let panelMessage = null;
                  if (panelMessageIdMatch) {
                    try {
                        panelMessage = await interaction.channel.messages.fetch(panelMessageIdMatch[1]);
                    } catch (error) {
                        console.error('Error fetching panel message by ID, reverting to search', error);
                        // Revert to searching last 100 messages
                        const channelMessages = await interaction.channel.messages.fetch({ limit: 100, cache: false, force: true });
                        panelMessage = channelMessages.find(msg =>
                            msg.author.id === interaction.client.user.id &&
                            msg.embeds.length > 0 &&
                            msg.components.length > 0 &&
                            msg.components[0].components.some(c => c.customId === 'ticket_claim')
                        );
                    }
                  } else {
                    // If topic does not have panel message ID, search last 100 messages
                    const channelMessages = await interaction.channel.messages.fetch({ limit: 100, cache: false, force: true });
                    panelMessage = channelMessages.find(msg =>
                        msg.author.id === interaction.client.user.id &&
                        msg.embeds.length > 0 &&
                        msg.components.length > 0 &&
                        msg.components[0].components.some(c => c.customId === 'ticket_claim')
                    );
                  }

                if (!panelMessage) {
                    console.warn('Main panel message not found during closing; continuing without editing panel message.');
                }


                try {
                    //  3. Move channel to closed category
                    await interaction.channel.setParent(closedCategoryId, { lockPermissions: false });
                    console.log(`Ticket channel ${interaction.channel.name} moved to category ${closedCategoryId}`);

                    // 4. Lock channel for creator
                    if (userId) { 
                         const ticketOwner = await interaction.guild.members.fetch(userId).catch(() => null);
                         if (ticketOwner) {
                            await interaction.channel.permissionOverwrites.edit(ticketOwner.id, { SendMessages: false });
                        }
                    }

                    // 5. Rename channel
                    await interaction.channel.setName(`closed-${interaction.channel.name.replace('ticket-', '')}`);

                    // 6. Update embed and buttons of panel message
                    const panelBaseEmbed = panelMessage?.embeds[0];
                    const typeField = panelBaseEmbed?.fields?.find(f => f.name === '📌 Type');
                    const originalType = typeField ? typeField.value.replace(/`/g, '') : (topic?.match(/Type: ([^.]+)/)?.[1] ?? 'unknown');

                    const closedEmbed = panelBaseEmbed
                        ? EmbedBuilder.from(panelBaseEmbed)
                        : new EmbedBuilder().addFields({ name: '📌 Type', value: `\`${originalType}\`` });

                    closedEmbed
                        .setTitle(`🔒 Closed Ticket (by ${interaction.user.username})`)
                        .setColor(Colors.DarkGrey);

                    // Remove 'Claimed by' field if present
                    if (closedEmbed.data.fields && closedEmbed.data.fields.some(f => f.name === 'Claimed by')) {
                        closedEmbed.setFields(closedEmbed.data.fields.filter(f => f.name !== 'Claimed by'));
                    }

                    const closedRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('ticket_delete').setLabel('Delete Ticket').setStyle(ButtonStyle.Danger).setEmoji('🗑️'),
                        new ButtonBuilder().setCustomId('ticket_reopen').setLabel('Reopen').setStyle(ButtonStyle.Success).setEmoji('🔓'),
                        new ButtonBuilder().setCustomId('ticket_transcript').setLabel('Transcript').setStyle(ButtonStyle.Primary).setEmoji('📄')
                    );

                    if (panelMessage) {
                        await panelMessage.edit({ embeds: [closedEmbed], components: [closedRow] });
                    }

                    // 7. Send confirmation message in channel
                    await interaction.channel.send({
                        embeds: [new EmbedBuilder().setColor(Colors.Blue).setDescription(`🔒 This ticket was closed and moved by ${interaction.user}.`)]
                    });

                    // Log ticket closure
                    const ticketOwner = interaction.guild.members.cache.get(userId);
                    const typeMatch = interaction.channel.topic?.match(/Type: ([^|]+)/);
                    const ticketType = typeMatch ? typeMatch[1].trim() : 'Unknown';
                    await logger.ticketClosed(readyClient, ticketOwner?.user || { id: userId }, ticketType, interaction.channel.name, interaction.user);

                } catch (error) {
                     console.error("Error during ticket close/move:", error);
                     await logger.error(readyClient, 'Ticket Closure Error', error.message, `Channel: ${interaction.channel.name}`);
                     await interaction.followUp({ embeds: [createErrorEmbed(`Error closing or moving ticket: ${error.message}`)], flags: [MessageFlags.Ephemeral] });
                }
            }

            // --- Reopen Ticket Button --- (Admin only)
            if (customId === 'ticket_reopen') {
                if (!isAdmin) {
                     // Use ephemeral response for access errors
                     return interaction.reply({ embeds: [createErrorEmbed('Only admins can reopen tickets.')], flags: [MessageFlags.Ephemeral] });
                }
                await interaction.deferUpdate(); // Defer button click

                try {
                    const panelEmbed = interaction.message.embeds[0];
                    const typeField = panelEmbed?.fields?.find(f => f.name === '📌 Type');
                    const originalType = typeField ? typeField.value.replace(/`/g, '') : (topic?.match(/Type: ([^.]+)/)?.[1] ?? 'unknown');

                    const targetCategory = await ticketCategoryManager.getOrCreateTicketCategory(interaction.guild, originalType, config.ticket_category_id);
                    if (!targetCategory) {
                        throw new Error('Ticket category not found');
                    }

                    //  2. Move channel to main category
                    await interaction.channel.setParent(targetCategory.id, { lockPermissions: false });
                    console.log(`Ticket channel ${interaction.channel.name} returned to category ${targetCategory.id}`);

                    // 3. Open channel for creator
                    if (userId) { // userId from the start of the button handler
                        const ticketOwner = await interaction.guild.members.fetch(userId).catch(() => null);
                        if (ticketOwner) {
                            await interaction.channel.permissionOverwrites.edit(ticketOwner.id, { SendMessages: true });
                        }
                    }

                    // 4. Rename channel
                    await interaction.channel.setName(`ticket-${interaction.channel.name.replace('closed-', '')}`);

                    // 5. Restore original embed and buttons of panel message
                    const originalEmbed = interaction.message.embeds[0]; // Message here is the panel message

                    const reopenedEmbed = EmbedBuilder.from(originalEmbed)
                        .setTitle(`🎫 Ticket ${originalType}`)
                        .setColor(Colors.Green);

                    // Remove 'Claimed by' field if present
                    if (reopenedEmbed.data.fields && reopenedEmbed.data.fields.some(f => f.name === 'Claimed by')) {
                        reopenedEmbed.setFields(reopenedEmbed.data.fields.filter(f => f.name !== 'Claimed by'));
                    }

                    const originalRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('ticket_claim').setLabel('Claim').setStyle(ButtonStyle.Primary).setEmoji('✋').setDisabled(false),
                        new ButtonBuilder().setCustomId('ticket_close').setLabel('Close').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
                        new ButtonBuilder().setCustomId('ticket_add_user').setLabel('Add').setStyle(ButtonStyle.Secondary).setEmoji('➕'),
                        new ButtonBuilder().setCustomId('ticket_remove_user').setLabel('Remove').setStyle(ButtonStyle.Secondary).setEmoji('➖'),
                        new ButtonBuilder().setCustomId('ticket_transcript').setLabel('Transcript').setStyle(ButtonStyle.Success).setEmoji('📄')
                    );

                    // Edit main panel message
                    await interaction.editReply({ embeds: [reopenedEmbed], components: [originalRow] });

                    // 6. Send confirmation message in channel
                    await interaction.channel.send({ embeds: [createSuccessEmbed(`🔓 This ticket was reopened and moved by ${interaction.user}.`)] });

                } catch (error) {
                     console.error("Error during ticket reopen/move:", error);
                     await logger.error(readyClient, 'Ticket Reopen Error', error.message, `Channel: ${interaction.channel.name}`);
                     await interaction.followUp({ embeds: [createErrorEmbed(`Error reopening or moving ticket: ${error.message}`)], flags: [MessageFlags.Ephemeral] });
                }
            }

            // --- Delete Ticket Button --- (Admin only)
            if (customId === 'ticket_delete') {
                if (!isAdmin) {
                    return interaction.reply({ content: 'Only admins can delete tickets.', flags: [MessageFlags.Ephemeral] });
                }
                await interaction.deferUpdate();

                const ticketOwnerId = userId;
                const typeMatch = interaction.channel.topic?.match(/Type: ([^|]+)/);
                const ticketType = typeMatch ? typeMatch[1].trim() : 'Unknown';
                
                if (ticketOwnerId) {
                    try {
                        const ticketOwner = await client.users.fetch(ticketOwnerId);
                        const attachment = await discordTranscripts.createTranscript(interaction.channel, {
                            limit: -1,
                            returnType: 'attachment',
                            filename: `transcript-${interaction.channel.name}.html`,
                            saveImages: true,
                            poweredBy: false
                        });

                        const dmEmbed = new EmbedBuilder()
                            .setColor(Colors.Blue)
                            .setTitle('Closed Ticket and Transcript')
                            .setDescription(`Your ticket (${interaction.channel.name}) has been closed and deleted.`)
                            .addFields(
                                { name: 'Server', value: interaction.guild.name, inline: true },
                                { name: 'Closed by', value: interaction.user.tag, inline: true }
                            )
                            .setTimestamp();

                        await ticketOwner.send({
                            embeds: [dmEmbed],
                            files: [attachment]
                        });

                        // Log ticket deletion
                        await logger.ticketDeleted(readyClient, ticketOwner, ticketType, interaction.user);
                    } catch (error) {
                        console.error(`Error sending DM to ticket owner ${ticketOwnerId}:`, error);
                        await logger.error(readyClient, 'DM Send Error', error.message, `User: ${ticketOwnerId}`);
                    }
                }

                await interaction.channel.send({
                    embeds: [new EmbedBuilder().setColor(Colors.Red).setDescription('🗑️ This channel will be deleted in 5 seconds...')]
                });
                setTimeout(async () => {
                    await interaction.channel.delete();
                }, 5000);
            }

            // --- Add User Button (Show modal) --- (Admin only)
            if (customId === 'ticket_add_user') {
                if (!isAdmin) {
                    return interaction.reply({ content: 'Only admins can add users.', flags: [MessageFlags.Ephemeral] });
                }
                const modal = new ModalBuilder()
                    .setCustomId('ticket_add_user_modal')
                    .setTitle('Add User to Ticket');
                const userIdInput = new TextInputBuilder()
                    .setCustomId('user_id_input')
                    .setLabel('Enter user ID:')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);
                modal.addComponents(new ActionRowBuilder().addComponents(userIdInput));
                await interaction.showModal(modal);
            }

            // --- Remove User Button (Show modal) --- (Admin only)
            if (customId === 'ticket_remove_user') {
                if (!isAdmin) {
                    return interaction.reply({ content: 'Only admins can remove users.', flags: [MessageFlags.Ephemeral] });
                }
                const modal = new ModalBuilder()
                    .setCustomId('ticket_remove_user_modal')
                    .setTitle('Remove User from Ticket');
                const userIdInput = new TextInputBuilder()
                    .setCustomId('user_id_input')
                    .setLabel('Enter user ID:')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);
                modal.addComponents(new ActionRowBuilder().addComponents(userIdInput));
                await interaction.showModal(modal);
            }

            // --- Transcript Button --- (Admin or ticket creator)
            if (customId === 'ticket_transcript') {
                if (!isAdmin && !isOwner) { 
                    return interaction.reply({ content: 'You do not have permission to get a transcript.', flags: [MessageFlags.Ephemeral] });
                }
                await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

                try {
                    const attachment = await discordTranscripts.createTranscript(interaction.channel, {
                        limit: -1,
                        returnType: 'attachment',
                        filename: `transcript-${interaction.channel.name}.html`,
                        saveImages: true,
                        poweredBy: false
                    });

                    const transcriptEmbed = new EmbedBuilder()
                        .setTitle('📄 Ticket Transcript')
                        .setDescription(`Transcript for channel ${interaction.channel} is ready.`)
                        .setColor(Colors.Blue);

                    await interaction.editReply({
                        embeds: [transcriptEmbed],
                        files: [attachment]
                    });

                    // Log transcript generation
                    const ticketOwner = interaction.guild.members.cache.get(userId);
                    await logger.transcriptGenerated(readyClient, ticketOwner?.user || { id: userId }, interaction.user, attachment.name);
                } catch (error) {
                    console.error('Error creating transcript:', error);
                    await logger.error(readyClient, 'Transcript Generation Error', error.message, `Channel: ${interaction.channel.name}`);

                    if (interaction.deferred || interaction.replied) {
                        try {
                            await interaction.editReply({ content: 'An error occurred while creating the transcript.', embeds: [], files: [] });
                        } catch (editError) {
                            console.error('Error editing response after transcript error:', editError);
                        }
                    }
                }
            }
            return; 
        }
    });
});

// Function to create ticket channel
async function createTicketChannel(interaction, type, reason = null) {
    const guild = interaction.guild;
    const user = interaction.user;
    
    // Security validation for ticket creation
    const securityCheck = security.validateTicketCreation(user, guild);
    if (!securityCheck.valid) {
        const errorEmbed = new EmbedBuilder()
            .setTitle('❌ Security Check Failed')
            .setDescription(securityCheck.issues.join('\n'))
            .setColor(Colors.Red);
        await interaction.editReply({ embeds: [errorEmbed], flags: [MessageFlags.Ephemeral] });
        return;
    }

    // Is there a ticket limit?
    const ticketLimit = config.max_tickets_per_user || 3;
    const userTicketChannels = guild.channels.cache.filter(ch => 
        ch.type === ChannelType.GuildText &&
        ch.topic &&
        ch.topic.includes(`ID: ${user.id}`) &&
        ticketCategoryManager.isTicketCategory(ch.parent)
    );
    if (userTicketChannels.size >= ticketLimit) {
        const limitEmbed = new EmbedBuilder()
            .setTitle('❌ Error creating ticket')
            .setDescription(`You currently have ${userTicketChannels.size} open tickets and cannot have more than ${ticketLimit} open tickets.\n\nPlease close your previous tickets first:\n${userTicketChannels.map(ch => `${ch}`).join('\n')}`)
            .setColor(Colors.Red);
        await interaction.editReply({ embeds: [limitEmbed], flags: [MessageFlags.Ephemeral] });
        
        // Log ticket limit reached
        await logger.ticketLimitReached(client, user, ticketLimit);
        return;
    }

    const normalizedType = typeof type === 'string' ? type.toLowerCase() : '';
    const mentionRoleIds = [config.admin_role_id];
    
    if (config.support_team_role_id && !mentionRoleIds.includes(config.support_team_role_id)) {
        mentionRoleIds.push(config.support_team_role_id);
    }

    // Create new channel
    let category;
    try {
        // Find the selected ticket option to get the emoji
        const selectedOption = config.ticket_options.find(opt => opt.value === type);
        const emoji = selectedOption?.emoji || '';
        
        category = await ticketCategoryManager.getOrCreateTicketCategory(guild, type, emoji);
        
        // Add admin role permissions to the category
        if (adminRoleId) {
            await category.permissionOverwrites.edit(adminRoleId, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true,
                AttachFiles: true,
                ManageChannels: true
            });
        }
        
        // Add support team role permissions if configured
        if (config.support_team_role_id) {
            await category.permissionOverwrites.edit(config.support_team_role_id, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true,
                AttachFiles: true
            });
        }
    } catch (error) {
        console.error('Error ensuring ticket category:', error);
        await interaction.editReply({ content: 'System error: Failed to create category for this ticket type.' });
        return;
    }

    if (!category) {
        await interaction.editReply({ content: 'System error: No suitable category found for this ticket.' });
        return;
    }

    try {
        const permissionOverwrites = [
            { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.AttachFiles] },
            { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels] },
            ...mentionRoleIds.map(roleId => ({
                id: roleId,
                allow: [
                    PermissionsBitField.Flags.ViewChannel,
                    PermissionsBitField.Flags.SendMessages,
                    PermissionsBitField.Flags.ReadMessageHistory,
                    PermissionsBitField.Flags.AttachFiles
                ]
            }))
        ];

        const channel = await guild.channels.create({
            name: `ticket-${type}-${user.username}`,
            type: ChannelType.GuildText,
            parent: category.id,
            topic: `Ticket for ${user.tag} (ID: ${user.id}). Type: ${type}.`, // For identification
            permissionOverwrites
        });

        let mentionContent = `${user}`;
        if (mentionRoleIds.length) {
            mentionContent += ' ' + mentionRoleIds.map(roleId => `<@&${roleId}>`).join(' ');
        }

        const ticketEmbed = new EmbedBuilder()
            .setTitle(`🎫 Ticket ${type}`)
            .setDescription(`Hello ${user}! Welcome to your ticket.\nPlease wait for an admin to respond.`)
            .setColor(Colors.Green)
            .addFields(
                { name: '👤 Creator', value: `${user}`, inline: true },
                { name: '📌 Type', value: `\`${type}\``, inline: true }
            )
            .setTimestamp();
        if (reason) {
            ticketEmbed.addFields({ name: '📝 Reason (Other)', value: reason });
        }

//  Create buttons
        const claimButton = new ButtonBuilder().setCustomId('ticket_claim').setLabel('Claim').setStyle(ButtonStyle.Primary).setEmoji('✋');
        const closeButton = new ButtonBuilder().setCustomId('ticket_close').setLabel('Close').setStyle(ButtonStyle.Danger).setEmoji('🔒');
        const addButton = new ButtonBuilder().setCustomId('ticket_add_user').setLabel('Add').setStyle(ButtonStyle.Secondary).setEmoji('➕');
        const removeButton = new ButtonBuilder().setCustomId('ticket_remove_user').setLabel('Remove').setStyle(ButtonStyle.Secondary).setEmoji('➖');
        const transcriptButton = new ButtonBuilder().setCustomId('ticket_transcript').setLabel('Transcript').setStyle(ButtonStyle.Success).setEmoji('📄');
        const controlRow = new ActionRowBuilder().addComponents(claimButton, closeButton, addButton, removeButton, transcriptButton);

        const panelMessage = await channel.send({
            content: mentionContent,
            embeds: [ticketEmbed],
            components: [controlRow]
        });

        // Update channel topic to include panel message ID and last message time for auto-closing
        const now = Date.now();
        const newTopic = `ID: ${user.id} | Type: ${type} | LastMessage: ${now} | PanelMessageID: ${panelMessage.id}`;
        // Max 1024 characters for Discord topic
        const truncatedTopic = newTopic.length > 1024 ? newTopic.substring(0, 1021) + '...' : newTopic;
        await channel.setTopic(truncatedTopic);

        await interaction.editReply({ content: `Your ticket has been successfully created in channel ${channel}.` });
        
        // Log ticket creation
        await logger.ticketCreated(interaction.client, user, type, channel.name, reason);
        
        setTimeout(async() =>
             interaction.deleteReply(),
                     10000
                     )

    } catch (error) {
        console.error('Error creating ticket channel:', error);
        await logger.error(interaction.client, 'Ticket Creation Error', error.message, `User: ${user.tag}`);
        await interaction.editReply({ content: 'An error occurred while creating the ticket channel.' });
    }
}


// Log in the bot
client.login(config.discord_token);

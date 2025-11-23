// autoClose.js - Automatic ticket closing management
const { ChannelType, EmbedBuilder, Colors } = require('discord.js');
const config = require('./config.json');
const Logger = require('./logger');

const logger = new Logger(config.log_channel_id);

const LAST_MESSAGE_KEY = 'LastMessage';
const WARNED_AT_KEY = 'WarnedAt';
const CLOSED_AT_KEY = 'ClosedAt';

// Sanitize topic (remove extra spaces)
function sanitizeTopic(topic) {
    if (!topic) return '';
    return topic.replace(/\s{2,}/g, ' ').trim();
}

// Get timestamp from topic
function getTopicTimestamp(topic, key) {
    if (!topic) return null;
    // Escape special regex characters in key
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`${escapedKey}: (\\d+)`);
    const match = topic.match(regex);
    return match ? parseInt(match[1], 10) : null;
}

// Set new timestamp in topic
function setTopicTimestamp(topic, key, value) {
    const base = topic ?? '';
    // Escape special regex characters in key
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`${escapedKey}: (\\d+)`);
    if (regex.test(base)) {
        return base.replace(regex, `${key}: ${value}`);
    }
    const separator = base.length > 0 ? ' ' : '';
    return `${base}${separator}${key}: ${value}`;
}

// Remove specific timestamp from topic
function removeTopicTimestamp(topic, key) {
    const base = topic ?? '';
    // Escape special regex characters in key
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\s*${escapedKey}: \\d+`);
    return base.replace(regex, '');
}

// 📅 Update last message timestamp when someone sends a new message in ticket
async function updateLastMessageTimestamp(channel) {
    try {
        const topic = channel.topic;
        const now = Date.now();

        // Only update LastMessage, don't touch the rest
        let newTopic = setTopicTimestamp(topic, LAST_MESSAGE_KEY, now);
        newTopic = sanitizeTopic(newTopic);

        await channel.setTopic(newTopic || null);
    } catch (err) {
        console.warn(`⚠️ Failed to update last message timestamp for ${channel.name}: ${err.message}`);
    }
}

// 🔍 Check for inactive tickets
async function checkInactiveTickets(client) {
    // If auto-closing is disabled, return
    if (!config.auto_close_enabled) {
        return;
    }

    const guild = client.guilds.cache.first();
    if (!guild) return;

    const ticketCategoryId = config.ticket_category_id;
    const closedCategoryId = config.closed_ticket_category_id;

    if (!ticketCategoryId || !closedCategoryId) {
        console.error('❌ ticket_category_id or closed_ticket_category_id not configured in config.json');
        await logger.error(client, 'Configuration Error', 'ticket_category_id or closed_ticket_category_id not configured', 'autoClose.js');
        return;
    }

    const now = Date.now();
    const closeDays = config.auto_close_days || 7;
    const warnDays = closeDays - 1;
    const closeMillis = closeDays * 24 * 60 * 60 * 1000;
    const warnMillis = warnDays * 24 * 60 * 60 * 1000;

    const ticketChannels = guild.channels.cache.filter(ch =>
        (ch.parentId === ticketCategoryId || ch.parentId === closedCategoryId) &&
        ch.type === ChannelType.GuildText
    );

    for (const channel of ticketChannels.values()) {
        // 🧱 Initial checks
        if (!guild.channels.cache.has(channel.id)) {
            console.log(`⚠️ Channel ${channel.id} no longer exists, skipping...`);
            continue;
        }

        if (channel.parentId === closedCategoryId) continue;
        if (!channel.topic) continue;

        const topic = channel.topic;
        const lastMessageTime = getTopicTimestamp(topic, LAST_MESSAGE_KEY);
        if (!lastMessageTime) continue;

        const warnedAt = getTopicTimestamp(topic, WARNED_AT_KEY);
        const timeSinceLastMessage = now - lastMessageTime;

        try {
            // 🚫 If configured days have passed → auto-close
            if (timeSinceLastMessage > closeMillis) {
                const closeEmbed = new EmbedBuilder()
                    .setTitle('🔒 Ticket Auto-Closed')
                    .setDescription(`Due to inactivity for ${closeDays} days, this ticket has been automatically closed.`)
                    .setColor(Colors.Red);

                await channel.send({ embeds: [closeEmbed] }).catch(() => null);

                if (guild.channels.cache.has(channel.id)) {
                    await channel.setParent(closedCategoryId, { lockPermissions: false }).catch(() => null);
                }

                let updatedTopic = removeTopicTimestamp(topic, WARNED_AT_KEY);
                updatedTopic = setTopicTimestamp(updatedTopic, CLOSED_AT_KEY, now);
                updatedTopic = sanitizeTopic(updatedTopic);
                await channel.setTopic(updatedTopic || null).catch(() => null);

                console.log(`✅ Ticket closed automatically: ${channel.name}`);
                
                // Log auto-close
                const userIdMatch = topic.match(/ID: (\d+)/);
                const userId = userIdMatch ? userIdMatch[1] : null;
                if (userId) {
                    try {
                        const user = await client.users.fetch(userId);
                        const typeMatch = topic.match(/Type: ([^|]+)/);
                        const ticketType = typeMatch ? typeMatch[1].trim() : 'Unknown';
                        await logger.autoClosedTicket(client, user, channel.name, closeDays);
                    } catch (err) {
                        console.warn(`Could not log auto-close for ${channel.name}`);
                    }
                }

            // ⚠️ If configured days minus one have passed but less than configured days → warn
            } else if (timeSinceLastMessage > warnMillis && !warnedAt) {
                const warnEmbed = new EmbedBuilder()
                    .setTitle('⚠️ Inactivity Warning')
                    .setDescription(`This ticket will be automatically closed in 24 hours due to inactivity.`)
                    .setColor(Colors.Orange);

                await channel.send({ embeds: [warnEmbed] }).catch(() => null);

                let updatedTopic = setTopicTimestamp(topic, WARNED_AT_KEY, now);
                updatedTopic = sanitizeTopic(updatedTopic);
                await channel.setTopic(updatedTopic || null).catch(() => null);

                console.log(`⚠️ Inactivity warning sent for: ${channel.name}`);
            }

        } catch (err) {
            console.warn(`⚠️ Error processing ticket ${channel.id}: ${err.message}`);
            await logger.warning(client, 'Ticket Processing Warning', err.message, `Channel: ${channel.name}`);
            continue;
        }
    }
}

module.exports = {
    updateLastMessageTimestamp,
    checkInactiveTickets
};

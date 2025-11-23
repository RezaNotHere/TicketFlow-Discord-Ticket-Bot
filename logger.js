// logger.js - Comprehensive logging system with embeds
const { EmbedBuilder, Colors } = require('discord.js');

class Logger {
    constructor(logChannelId) {
        this.logChannelId = logChannelId;
    }

    setLogChannel(logChannelId) {
        this.logChannelId = logChannelId;
    }

    /**
     * Send log to Discord channel
     * @param {Client} client - Discord client
     * @param {EmbedBuilder} embed - Embed to send
     */
    async sendLog(client, embed) {
        try {
            if (!this.logChannelId) {
                console.warn('⚠️ Log channel ID not configured');
                return;
            }

            const channel = client.channels.cache.get(this.logChannelId);
            if (!channel) {
                console.warn('⚠️ Log channel not found');
                return;
            }

            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('❌ Error sending log:', error);
        }
    }

    /**
     * Create a log embed with standard formatting
     */
    createEmbed(title, description, color) {
        return new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(color)
            .setTimestamp();
    }

    /**
     * Log bot startup
     */
    botStartup(client, botTag) {
        const embed = this.createEmbed(
            '✅ Bot Started',
            `Bot **${botTag}** has started successfully`,
            Colors.Green
        );
        this.sendLog(client, embed);
    }

    /**
     * Log ticket creation
     */
    async ticketCreated(client, user, ticketType, channelName, reason = null) {
        let description = `**User:** ${user}\n**Type:** ${ticketType}\n**Channel:** #${channelName}`;
        if (reason) {
            description += `\n**Reason:** ${reason}`;
        }

        const embed = this.createEmbed(
            '🎫 Ticket Created',
            description,
            Colors.Blue
        ).addFields(
            { name: 'User ID', value: user.id, inline: true },
            { name: 'Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:f>`, inline: true }
        );

        this.sendLog(client, embed);
    }

    /**
     * Log ticket closure
     */
    async ticketClosed(client, ticketOwner, ticketType, channelName, closedBy) {
        const embed = this.createEmbed(
            '🔒 Ticket Closed',
            `**Ticket Owner:** ${ticketOwner}\n**Type:** ${ticketType}\n**Channel:** #${channelName}\n**Closed By:** ${closedBy}`,
            Colors.DarkGrey
        ).addFields(
            { name: 'Owner ID', value: ticketOwner.id, inline: true },
            { name: 'Closed By', value: closedBy.id, inline: true }
        );

        this.sendLog(client, embed);
    }

    /**
     * Log ticket deletion
     */
    async ticketDeleted(client, ticketOwner, ticketType, deletedBy) {
        const embed = this.createEmbed(
            '🗑️ Ticket Deleted',
            `**Ticket Owner:** ${ticketOwner}\n**Type:** ${ticketType}\n**Deleted By:** ${deletedBy}`,
            Colors.Red
        ).addFields(
            { name: 'Owner ID', value: ticketOwner.id, inline: true },
            { name: 'Deleted By', value: deletedBy.id, inline: true }
        );

        this.sendLog(client, embed);
    }

    /**
     * Log ticket claim
     */
    async ticketClaimed(client, ticketOwner, ticketType, claimedBy) {
        const embed = this.createEmbed(
            '✋ Ticket Claimed',
            `**Ticket Owner:** ${ticketOwner}\n**Type:** ${ticketType}\n**Claimed By:** ${claimedBy}`,
            Colors.Yellow
        ).addFields(
            { name: 'Owner ID', value: ticketOwner.id, inline: true },
            { name: 'Claimed By', value: claimedBy.id, inline: true }
        );

        this.sendLog(client, embed);
    }

    /**
     * Log user added to ticket
     */
    async userAdded(client, ticketOwner, addedUser, addedBy) {
        const embed = this.createEmbed(
            '➕ User Added to Ticket',
            `**Ticket Owner:** ${ticketOwner}\n**Added User:** ${addedUser}\n**Added By:** ${addedBy}`,
            Colors.Green
        ).addFields(
            { name: 'Added User ID', value: addedUser.id, inline: true },
            { name: 'Added By', value: addedBy.id, inline: true }
        );

        this.sendLog(client, embed);
    }

    /**
     * Log user removed from ticket
     */
    async userRemoved(client, ticketOwner, removedUser, removedBy) {
        const embed = this.createEmbed(
            '➖ User Removed from Ticket',
            `**Ticket Owner:** ${ticketOwner}\n**Removed User:** ${removedUser}\n**Removed By:** ${removedBy}`,
            Colors.Orange
        ).addFields(
            { name: 'Removed User ID', value: removedUser.id, inline: true },
            { name: 'Removed By', value: removedBy.id, inline: true }
        );

        this.sendLog(client, embed);
    }

    /**
     * Log ticket transcript
     */
    async transcriptGenerated(client, ticketOwner, requestedBy, fileName) {
        const embed = this.createEmbed(
            '📄 Transcript Generated',
            `**Ticket Owner:** ${ticketOwner}\n**Requested By:** ${requestedBy}\n**File:** ${fileName}`,
            Colors.Blurple
        ).addFields(
            { name: 'Owner ID', value: ticketOwner.id, inline: true },
            { name: 'Requested By', value: requestedBy.id, inline: true }
        );

        this.sendLog(client, embed);
    }

    /**
     * Log command execution
     */
    async commandExecuted(client, commandName, user, guildName) {
        const embed = this.createEmbed(
            '⚙️ Command Executed',
            `**Command:** /${commandName}\n**User:** ${user}\n**Guild:** ${guildName}`,
            Colors.Greyple
        ).addFields(
            { name: 'User ID', value: user.id, inline: true },
            { name: 'Command', value: commandName, inline: true }
        );

        this.sendLog(client, embed);
    }

    /**
     * Log error
     */
    async error(client, errorTitle, errorMessage, context = null) {
        let description = `**Error:** ${errorMessage}`;
        if (context) {
            description += `\n**Context:** ${context}`;
        }

        const embed = this.createEmbed(
            `❌ ${errorTitle}`,
            description,
            Colors.Red
        );

        this.sendLog(client, embed);
    }

    /**
     * Log warning
     */
    async warning(client, warningTitle, warningMessage, context = null) {
        let description = `**Warning:** ${warningMessage}`;
        if (context) {
            description += `\n**Context:** ${context}`;
        }

        const embed = this.createEmbed(
            `⚠️ ${warningTitle}`,
            description,
            Colors.Orange
        );

        this.sendLog(client, embed);
    }

    /**
     * Log ticket limit reached
     */
    async ticketLimitReached(client, user, limit) {
        const embed = this.createEmbed(
            '📊 Ticket Limit Reached',
            `**User:** ${user}\n**Limit:** ${limit} open tickets`,
            Colors.Red
        ).addFields(
            { name: 'User ID', value: user.id, inline: true },
            { name: 'Limit', value: limit.toString(), inline: true }
        );

        this.sendLog(client, embed);
    }

    /**
     * Log auto-close action
     */
    async autoClosedTicket(client, ticketOwner, ticketName, inactivityDays) {
        const embed = this.createEmbed(
            '⏰ Auto-Close Executed',
            `**Ticket Owner:** ${ticketOwner}\n**Ticket:** #${ticketName}\n**Inactivity:** ${inactivityDays} days`,
            Colors.Purple
        ).addFields(
            { name: 'Owner ID', value: ticketOwner.id, inline: true },
            { name: 'Days Inactive', value: inactivityDays.toString(), inline: true }
        );

        this.sendLog(client, embed);
    }

    /**
     * Log ticket setup command
     */
    async setupExecuted(client, channel, user) {
        const embed = this.createEmbed(
            '🎫 Setup Command Executed',
            `**Channel:** ${channel}\n**Executed By:** ${user}`,
            Colors.Blue
        ).addFields(
            { name: 'Channel ID', value: channel.id, inline: true },
            { name: 'User ID', value: user.id, inline: true }
        );

        this.sendLog(client, embed);
    }

    /**
     * Log database operation
     */
    async databaseOperation(client, operation, details) {
        const embed = this.createEmbed(
            '💾 Database Operation',
            `**Operation:** ${operation}\n**Details:** ${details}`,
            Colors.LuminousVividBlue
        );

        this.sendLog(client, embed);
    }
}

module.exports = Logger;

// security.js - Security and validation utilities
const { PermissionsBitField } = require('discord.js');

class SecurityManager {
    constructor(config) {
        this.config = config;
        this.rateLimits = new Map(); // Simple in-memory rate limiting
        this.suspiciousUsers = new Set(); // Track suspicious users
    }

    // Validate Discord IDs format
    validateDiscordId(id) {
        return typeof id === 'string' && /^\d{17,19}$/.test(id);
    }

    // Validate user input for various fields
    sanitizeInput(input, maxLength = 1000) {
        if (typeof input !== 'string') return '';
        
        // Remove potentially harmful characters
        return input
            .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
            .replace(/[<>]/g, '') // Remove HTML brackets
            .trim()
            .substring(0, maxLength);
    }

    // Rate limiting check - optimized version
    checkRateLimit(userId, action, limit = 5, windowMs = 60000) {
        const key = `${userId}:${action}`;
        const now = Date.now();
        const userLimits = this.rateLimits.get(key);

        if (!userLimits || now > userLimits.resetTime) {
            // Create new window or reset expired one
            this.rateLimits.set(key, { count: 1, resetTime: now + windowMs });
            return true;
        }

        // Increment counter
        userLimits.count++;
        
        // Check limit
        if (userLimits.count > limit) {
            this.suspiciousUsers.add(userId);
            return false;
        }

        return true;
    }

    // Check if user has admin permissions
    hasAdminPermission(member) {
        if (!member || !this.config.admin_role_id) return false;
        
        return member.roles.cache.has(this.config.admin_role_id) ||
               member.permissions.has(PermissionsBitField.Flags.Administrator);
    }

    // Check if user has support permissions
    hasSupportPermission(member) {
        if (!member) return false;
        
        return this.hasAdminPermission(member) ||
               (this.config.support_team_role_id && member.roles.cache.has(this.config.support_team_role_id));
    }

    // Validate ticket creation
    validateTicketCreation(user, guild) {
        const issues = [];

        // Check rate limiting
        if (!this.checkRateLimit(user.id, 'ticket_create', 3, 300000)) {
            issues.push('You are creating tickets too quickly. Please wait a few minutes.');
        }

        // Check if user is in suspicious list
        if (this.suspiciousUsers.has(user.id)) {
            issues.push('Your account has been flagged for suspicious activity.');
        }

        // Check user account age
        const accountAge = Date.now() - user.createdTimestamp;
        const minAgeDays = 1; // Minimum 1 day old account
        if (accountAge < minAgeDays * 24 * 60 * 60 * 1000) {
            issues.push(`Your account must be at least ${minAgeDays} day(s) old to create tickets.`);
        }

        return {
            valid: issues.length === 0,
            issues
        };
    }

    // Validate channel permissions
    validateChannelPermissions(channel, member) {
        const issues = [];

        if (!channel.permissionsFor(member).has(PermissionsBitField.Flags.ViewChannel)) {
            issues.push('You do not have permission to view this channel.');
        }

        if (!channel.permissionsFor(member).has(PermissionsBitField.Flags.SendMessages)) {
            issues.push('You do not have permission to send messages in this channel.');
        }

        return {
            valid: issues.length === 0,
            issues
        };
    }

    // Check for suspicious patterns in messages - optimized version
    detectSuspiciousContent(content) {
        // Quick checks first (most common threats)
        const quickChecks = [
            /discord\.gg\/\w+/gi, // Discord invites
            /@everyone|@here/gi, // Mass mentions
        ];

        let score = 0;
        const detected = [];

        // Only do expensive checks if quick checks find something
        quickChecks.forEach((pattern, index) => {
            const matches = content.match(pattern);
            if (matches) {
                score += matches.length * 2; // Weight quick checks higher
                detected.push(`Quick Pattern ${index + 1}: ${matches.length} matches`);
            }
        });

        // Only do expensive regex checks if content is very long or quick checks found something
        if (content.length > 500 || score > 0) {
            const expensiveChecks = [
                /(http|https):\/\/[^\s]+/gi, // Links
                /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu // Excessive emojis
            ];

            expensiveChecks.forEach((pattern, index) => {
                const matches = content.match(pattern);
                if (matches) {
                    score += matches.length;
                    detected.push(`Pattern ${index + 3}: ${matches.length} matches`);
                }
            });
        }

        return {
            suspicious: score > 3, // Lower threshold for better detection
            score,
            detected
        };
    }

    // Log security events
    async logSecurityEvent(client, type, details) {
        if (!this.config.log_channel_id) return;

        const logChannel = client.channels.cache.get(this.config.log_channel_id);
        if (!logChannel) return;

        const embed = {
            title: `🔒 Security Alert: ${type}`,
            description: details,
            color: 0xFF0000,
            timestamp: new Date()
        };

        try {
            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Failed to log security event:', error);
        }
    }

    // Clean up old rate limit entries - optimized version
    cleanupRateLimits() {
        const now = Date.now();
        const keysToDelete = [];

        for (const [key, data] of this.rateLimits.entries()) {
            if (now > data.resetTime) {
                keysToDelete.push(key);
            }
        }

        // Batch delete for better performance
        keysToDelete.forEach(key => this.rateLimits.delete(key));
    }
}

module.exports = SecurityManager;

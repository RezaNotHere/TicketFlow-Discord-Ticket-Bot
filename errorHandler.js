// errorHandler.js - Centralized error handling and security monitoring
const { EmbedBuilder, Colors } = require('discord.js');

class ErrorHandler {
    constructor(logger, security) {
        this.logger = logger;
        this.security = security;
        this.errorCounts = new Map();
        this.suspiciousPatterns = new Map();
    }

    // Handle errors with security context
    async handleError(client, error, context = {}) {
        const errorId = this.generateErrorId();
        const timestamp = new Date();
        
        // Track error frequency
        const errorType = error.name || 'Unknown';
        this.errorCounts.set(errorType, (this.errorCounts.get(errorType) || 0) + 1);

        // Log to console with context
        console.error(`[${errorId}] ${errorType}: ${error.message}`, {
            context,
            stack: error.stack,
            timestamp
        });

        // Check for suspicious error patterns
        await this.checkSuspiciousPatterns(client, error, context, errorId);

        // Send to Discord log channel if available
        if (this.logger && this.logger.logChannelId) {
            await this.sendErrorToDiscord(client, error, context, errorId, timestamp);
        }

        // Take automatic actions based on error severity
        await this.takeAutomatedAction(client, error, context, errorId);
    }

    // Generate unique error ID
    generateErrorId() {
        return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }

    // Check for suspicious error patterns
    async checkSuspiciousPatterns(client, error, context, errorId) {
        const suspiciousIndicators = [
            /permission/i.test(error.message),
            /forbidden/i.test(error.message),
            /unauthorized/i.test(error.message),
            /rate.*limit/i.test(error.message),
            /timeout/i.test(error.message),
            context.userId && this.security.suspiciousUsers.has(context.userId)
        ];

        const isSuspicious = suspiciousIndicators.some(indicator => indicator === true);

        if (isSuspicious) {
            const pattern = `${error.name}:${context.userId || 'unknown'}`;
            this.suspiciousPatterns.set(pattern, (this.suspiciousPatterns.get(pattern) || 0) + 1);

            // If pattern repeats, take action
            if (this.suspiciousPatterns.get(pattern) > 3) {
                await this.security.logSecurityEvent(client, 'Repeated Suspicious Errors', 
                    `Error ID: ${errorId}\nUser: ${context.userId || 'Unknown'}\nPattern: ${pattern}\nCount: ${this.suspiciousPatterns.get(pattern)}`);
            }
        }
    }

    // Send error details to Discord log channel
    async sendErrorToDiscord(client, error, context, errorId, timestamp) {
        try {
            const logChannel = client.channels.cache.get(this.logger.logChannelId);
            if (!logChannel) return;

            const embed = new EmbedBuilder()
                .setTitle(`🚨 Error: ${error.name || 'Unknown'}`)
                .setDescription(`**Error ID:** \`${errorId}\`\n**Message:** ${error.message}`)
                .setColor(Colors.Red)
                .addFields(
                    { name: 'Timestamp', value: timestamp.toISOString(), inline: true },
                    { name: 'User', value: context.userId ? `<@${context.userId}>` : 'Unknown', inline: true },
                    { name: 'Channel', value: context.channelId ? `<#${context.channelId}>` : 'Unknown', inline: true },
                    { name: 'Command', value: context.commandName || 'N/A', inline: true },
                    { name: 'Error Count', value: `${this.errorCounts.get(error.name || 'Unknown') || 1}`, inline: true }
                );

            // Add stack trace if available and not too long
            if (error.stack && error.stack.length < 1000) {
                embed.addFields({
                    name: 'Stack Trace',
                    value: `\`\`\`${error.stack.substring(0, 1000)}${error.stack.length > 1000 ? '...' : ''}\`\`\``,
                    inline: false
                });
            }

            await logChannel.send({ embeds: [embed] });

        } catch (logError) {
            console.error('Failed to send error to Discord:', logError);
        }
    }

    // Take automated actions based on error patterns
    async takeAutomatedAction(client, error, context, errorId) {
        const errorType = error.name || 'Unknown';
        const errorCount = this.errorCounts.get(errorType);

        // If same error occurs frequently, it might be a systemic issue
        if (errorCount > 10) {
            await this.security.logSecurityEvent(client, 'High Error Frequency', 
                `Error Type: ${errorType}\nCount: ${errorCount}\nLatest ID: ${errorId}`);
        }

        // If permission errors are frequent, might be attack attempt
        if (errorType.includes('Permission') && errorCount > 5) {
            await this.security.logSecurityEvent(client, 'Frequent Permission Errors', 
                `User: ${context.userId || 'Unknown'}\nCount: ${errorCount}\nLatest ID: ${errorId}`);
        }

        // If rate limit errors, implement backoff
        if (errorType.includes('RateLimit')) {
            console.warn(`Rate limit detected (ID: ${errorId}). Implementing backoff.`);
            // You could implement exponential backoff here
        }
    }

    // Handle unhandled promise rejections
    setupUnhandledRejectionHandler(client) {
        process.on('unhandledRejection', async (reason, promise) => {
            const error = new Error(`Unhandled Rejection: ${reason}`);
            error.stack = promise.stack;
            
            await this.handleError(client, error, {
                type: 'unhandledRejection',
                promise: promise.toString().substring(0, 200)
            });
        });
    }

    // Handle uncaught exceptions
    setupUncaughtExceptionHandler(client) {
        process.on('uncaughtException', async (error) => {
            await this.handleError(client, error, {
                type: 'uncaughtException'
            });
            
            // For critical errors, it's safer to restart
            console.error('Uncaught exception detected. Restarting process...');
            process.exit(1);
        });
    }

    // Get error statistics
    getErrorStats() {
        return {
            totalErrors: Array.from(this.errorCounts.values()).reduce((a, b) => a + b, 0),
            errorTypes: Object.fromEntries(this.errorCounts),
            suspiciousPatterns: Object.fromEntries(this.suspiciousPatterns)
        };
    }

    // Reset error statistics
    resetStats() {
        this.errorCounts.clear();
        this.suspiciousPatterns.clear();
    }
}

module.exports = ErrorHandler;

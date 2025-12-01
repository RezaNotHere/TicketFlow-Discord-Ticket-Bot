// inputValidator.js - Input validation and sanitization utilities

class InputValidator {
    // Validate and sanitize user ID
    static validateUserId(userId) {
        if (typeof userId !== 'string') return { valid: false, error: 'User ID must be a string' };
        
        // Check if it's a valid Discord snowflake ID (17-19 digits)
        if (!/^\d{17,19}$/.test(userId)) {
            return { valid: false, error: 'Invalid user ID format' };
        }
        
        return { valid: true, value: userId };
    }

    // Validate and sanitize channel ID
    static validateChannelId(channelId) {
        if (typeof channelId !== 'string') return { valid: false, error: 'Channel ID must be a string' };
        
        if (!/^\d{17,19}$/.test(channelId)) {
            return { valid: false, error: 'Invalid channel ID format' };
        }
        
        return { valid: true, value: channelId };
    }

    // Validate and sanitize role ID
    static validateRoleId(roleId) {
        if (typeof roleId !== 'string') return { valid: false, error: 'Role ID must be a string' };
        
        if (!/^\d{17,19}$/.test(roleId)) {
            return { valid: false, error: 'Invalid role ID format' };
        }
        
        return { valid: true, value: roleId };
    }

    // Validate and sanitize ticket reason
    static validateTicketReason(reason, minLength = 10, maxLength = 1000) {
        if (typeof reason !== 'string') {
            return { valid: false, error: 'Reason must be a string' };
        }

        // Remove potentially harmful characters
        const sanitized = reason
            .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
            .replace(/`/g, "'") // Replace backticks with single quotes
            .trim();

        if (sanitized.length < minLength) {
            return { valid: false, error: `Reason must be at least ${minLength} characters long` };
        }

        if (sanitized.length > maxLength) {
            return { valid: false, error: `Reason must not exceed ${maxLength} characters` };
        }

        // Check for suspicious patterns
        const suspiciousPatterns = [
            /discord\.gg\/\w+/gi, // Discord invites
            /@everyone|@here/gi, // Mass mentions
        ];

        for (const pattern of suspiciousPatterns) {
            if (pattern.test(sanitized)) {
                return { valid: false, error: 'Reason contains suspicious content' };
            }
        }

        return { valid: true, value: sanitized };
    }

    // Validate and sanitize color hex code
    static validateColorHex(color) {
        if (typeof color !== 'string') {
            return { valid: false, error: 'Color must be a string' };
        }

        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (!hexRegex.test(color)) {
            return { valid: false, error: 'Invalid hex color format' };
        }

        return { valid: true, value: color };
    }

    // Validate and sanitize embed title
    static validateEmbedTitle(title, maxLength = 256) {
        if (typeof title !== 'string') {
            return { valid: false, error: 'Title must be a string' };
        }

        const sanitized = title
            .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
            .trim();

        if (sanitized.length === 0) {
            return { valid: false, error: 'Title cannot be empty' };
        }

        if (sanitized.length > maxLength) {
            return { valid: false, error: `Title must not exceed ${maxLength} characters` };
        }

        return { valid: true, value: sanitized };
    }

    // Validate and sanitize embed description
    static validateEmbedDescription(description, maxLength = 4096) {
        if (typeof description !== 'string') {
            return { valid: false, error: 'Description must be a string' };
        }

        const sanitized = description
            .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
            .replace(/`/g, "'") // Replace backticks
            .trim();

        if (sanitized.length === 0) {
            return { valid: false, error: 'Description cannot be empty' };
        }

        if (sanitized.length > maxLength) {
            return { valid: false, error: `Description must not exceed ${maxLength} characters` };
        }

        return { valid: true, value: sanitized };
    }

    // Validate ticket options configuration
    static validateTicketOptions(options) {
        if (!Array.isArray(options)) {
            return { valid: false, error: 'Ticket options must be an array' };
        }

        if (options.length === 0) {
            return { valid: false, error: 'At least one ticket option must be provided' };
        }

        const errors = [];

        for (let i = 0; i < options.length; i++) {
            const option = options[i];
            const index = i + 1;

            // Check required fields
            if (!option.label || typeof option.label !== 'string') {
                errors.push(`Option ${index}: Label is required and must be a string`);
            }

            if (!option.value || typeof option.value !== 'string') {
                errors.push(`Option ${index}: Value is required and must be a string`);
            }

            if (!option.description || typeof option.description !== 'string') {
                errors.push(`Option ${index}: Description is required and must be a string`);
            }

            // Validate label length
            if (option.label && (option.label.length < 1 || option.label.length > 100)) {
                errors.push(`Option ${index}: Label must be between 1 and 100 characters`);
            }

            // Validate value format (alphanumeric and underscores only)
            if (option.value && !/^[a-zA-Z0-9_]+$/.test(option.value)) {
                errors.push(`Option ${index}: Value must contain only letters, numbers, and underscores`);
            }

            // Validate requiresReason
            if (option.requiresReason !== undefined && typeof option.requiresReason !== 'boolean') {
                errors.push(`Option ${index}: requiresReason must be a boolean`);
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    // Validate numeric configuration values
    static validateNumber(value, min, max, fieldName) {
        const num = Number(value);

        if (isNaN(num)) {
            return { valid: false, error: `${fieldName} must be a number` };
        }

        if (num < min) {
            return { valid: false, error: `${fieldName} must be at least ${min}` };
        }

        if (num > max) {
            return { valid: false, error: `${fieldName} must not exceed ${max}` };
        }

        return { valid: true, value: num };
    }

    // Validate boolean configuration values
    static validateBoolean(value, fieldName) {
        if (typeof value !== 'boolean') {
            return { valid: false, error: `${fieldName} must be true or false` };
        }

        return { valid: true, value };
    }

    // Comprehensive config validation
    static validateConfig(config) {
        const errors = [];

        // Validate required Discord IDs
        if (!this.validateUserId(config.client_id).valid) {
            errors.push('Invalid client_id in config');
        }

        if (!this.validateUserId(config.guild_id).valid) {
            errors.push('Invalid guild_id in config');
        }

        if (!this.validateChannelId(config.log_channel_id).valid) {
            errors.push('Invalid log_channel_id in config');
        }

        if (!this.validateChannelId(config.closed_ticket_category_id).valid) {
            errors.push('Invalid closed_ticket_category_id in config');
        }

        if (!this.validateRoleId(config.admin_role_id).valid) {
            errors.push('Invalid admin_role_id in config');
        }

        // Validate support team role (optional)
        if (config.support_team_role_id && !this.validateRoleId(config.support_team_role_id).valid) {
            errors.push('Invalid support_team_role_id in config');
        }

        // Validate ticket limits
        const maxTickets = this.validateNumber(config.max_tickets_per_user, 1, 50, 'max_tickets_per_user');
        if (!maxTickets.valid) {
            errors.push(maxTickets.error);
        }

        // Validate auto-close settings
        if (config.auto_close_enabled !== undefined && !this.validateBoolean(config.auto_close_enabled, 'auto_close_enabled').valid) {
            errors.push('auto_close_enabled must be true or false');
        }

        const autoCloseDays = this.validateNumber(config.auto_close_days, 1, 30, 'auto_close_days');
        if (!autoCloseDays.valid) {
            errors.push(autoCloseDays.error);
        }

        // Validate ticket embed
        if (config.ticket_embed) {
            const titleValidation = this.validateEmbedTitle(config.ticket_embed.title);
            if (!titleValidation.valid) {
                errors.push(`ticket_embed.title: ${titleValidation.error}`);
            }

            const descValidation = this.validateEmbedDescription(config.ticket_embed.description);
            if (!descValidation.valid) {
                errors.push(`ticket_embed.description: ${descValidation.error}`);
            }

            if (config.ticket_embed.color && !this.validateColorHex(config.ticket_embed.color).valid) {
                errors.push('ticket_embed.color: Invalid hex color format');
            }
        }

        // Validate ticket options
        const optionsValidation = this.validateTicketOptions(config.ticket_options);
        if (!optionsValidation.valid) {
            errors.push(...optionsValidation.errors);
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}

module.exports = InputValidator;

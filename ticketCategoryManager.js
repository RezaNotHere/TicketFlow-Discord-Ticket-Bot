// ticketCategoryManager.js - Manage ticket categories
const { ChannelType } = require('discord.js');

// Ticket category prefix
const CATEGORY_PREFIX = '🎫-';

// Normalize type label - convert ticket type name to standard format
function normalizeTypeLabel(type) {
    if (!type) {
        return 'General'; // General
    }

    const cleaned = type
        .toString()
        .replace(/[_]+/g, ' ') // Replace underscores with space
        .trim() // Remove extra spaces from start and end
        .replace(/\s+/g, ' '); // Replace multiple spaces with a single space

    if (!cleaned.length) {
        return 'General'; // General
    }

    return cleaned
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter of each word
        .join(' ');
}

// Get category name - create category name based on ticket type
function getCategoryName(type) {
    return `${CATEGORY_PREFIX}${normalizeTypeLabel(type)}`;
}

// Check if a category is a ticket category - identify ticket categories
function isTicketCategory(category) {
    return Boolean(category)
        && category.type === ChannelType.GuildCategory
        && typeof category.name === 'string'
        && category.name.startsWith(CATEGORY_PREFIX);
}

// Find ticket categories - search for all existing ticket categories
function findTicketCategories(guild) {
    if (!guild) {
        return [];
    }

    return guild.channels.cache
        .filter(channel => isTicketCategory(channel))
        .map(channel => channel);
}

// Get ticket category IDs
function getTicketCategoryIds(guild) {
    return findTicketCategories(guild).map(category => category.id);
}

// Get or create ticket category
async function getOrCreateTicketCategory(guild, type, templateCategoryId) {
    const categoryName = getCategoryName(type);

    // Find existing category
    let category = guild.channels.cache.find(channel =>
        channel.type === ChannelType.GuildCategory && channel.name === categoryName
    );

    if (category) {
        return category; // If it exists, return it
    }

    // Options for creating a new category
    const options = {
        name: categoryName,
        type: ChannelType.GuildCategory,
        reason: `Automatic category for ticket type: ${normalizeTypeLabel(type)}`
    };

    // Copy permissions from template category
    if (templateCategoryId) {
        const templateCategory = guild.channels.cache.get(templateCategoryId);
        if (templateCategory && templateCategory.type === ChannelType.GuildCategory) {
            options.permissionOverwrites = templateCategory.permissionOverwrites.cache.map(overwrite => ({
                id: overwrite.id,
                allow: overwrite.allow.bitfield,
                deny: overwrite.deny.bitfield
            }));
        }
    }

    // Create new category
    category = await guild.channels.create(options);
    return category;
}

module.exports = {
    CATEGORY_PREFIX,
    normalizeTypeLabel,
    getCategoryName,
    isTicketCategory,
    findTicketCategories,
    getTicketCategoryIds,
    getOrCreateTicketCategory
};

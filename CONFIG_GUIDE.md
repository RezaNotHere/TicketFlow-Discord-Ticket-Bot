# TicketFlow Configuration Guide

This guide will help you understand and configure all the settings in `config.json`.

## 📋 Table of Contents

1. [Discord Bot Credentials](#discord-bot-credentials)
2. [Channel & Category Settings](#channel--category-settings)
3. [Role Settings](#role-settings)
4. [Auto-Close Settings](#auto-close-settings)
5. [Ticket Limits](#ticket-limits)
6. [Appearance Settings](#appearance-settings)
7. [Ticket Options](#ticket-options)

---

## 🔐 Discord Bot Credentials

These are essential for your bot to function.

### `discord_token`
- **What it is:** Your Discord bot's authentication token
- **Where to get it:** [Discord Developer Portal](https://discord.com/developers/applications)
- **How to get it:** 
  1. Create/Select your application
  2. Go to "Bot" section
  3. Click "Copy" under TOKEN
- **Example:** `YOUR_ACTUAL_BOT_TOKEN_HERE`
- **⚠️ WARNING:** Never share this token! Keep it secret!

### `client_id`
- **What it is:** Your bot's unique ID
- **Where to get it:** [Discord Developer Portal](https://discord.com/developers/applications) → General Information
- **Example:** `123456789012345678`

### `guild_id`
- **What it is:** The ID of your Discord server (Guild)
- **How to get it:** 
  1. Enable Developer Mode in Discord (User Settings → App Settings → Advanced → Developer Mode)
  2. Right-click your server name
  3. Select "Copy Server ID"
- **Example:** `987654321098765432`

---

## 🎯 Channel & Category Settings

These settings define where tickets and logs will be created and stored.

### `ticket_category_id`
- **What it is:** The category where NEW/OPEN tickets will be created
- **How to get it:**
  1. Enable Developer Mode in Discord
  2. Right-click the category
  3. Select "Copy Category ID"
- **Example:** `1111111111111111111`
- **Note:** Create a category in your server first, then copy its ID

### `closed_ticket_category_id`
- **What it is:** The category where CLOSED tickets will be moved to
- **How to get it:** Same as above
- **Example:** `2222222222222222222`
- **Note:** This helps keep your server organized!

### `log_channel_id`
- **What it is:** Where TicketFlow will send logs and activity reports
- **How to get it:**
  1. Enable Developer Mode
  2. Right-click the channel
  3. Select "Copy Channel ID"
- **Example:** `3333333333333333333`
- **Features logged:**
  - Ticket creation/closure
  - User additions/removals
  - Bot startup
  - Errors and warnings
  - And more!

---

## 👥 Role Settings

Control who has permission to manage tickets.

### `admin_role_id`
- **What it is:** The role with full control over tickets (can claim, close, delete, add/remove users)
- **How to get it:**
  1. Enable Developer Mode
  2. Right-click the role (in Server Settings → Roles)
  3. Select "Copy Role ID"
- **Example:** `4444444444444444444`
- **Permissions:** Full ticket management

### `support_team_role_id`
- **What it is:** The role for support team members (will be mentioned in new tickets)
- **How to get it:** Same as above
- **Example:** `5555555555555555555`
- **Permissions:** Can view and respond to tickets

---

## ⏱️ Auto-Close Settings

Automatically close inactive tickets to keep things tidy.

### `auto_close_enabled`
- **What it is:** Turn auto-close feature ON/OFF
- **Options:** `true` (enabled) or `false` (disabled)
- **Example:** `true`

### `auto_close_days`
- **What it is:** Number of days of inactivity before auto-closing a ticket
- **Example:** `7` (closes ticket after 7 days with no messages)
- **Note:** Users will receive a warning 24 hours before closure

---

## 📊 Ticket Limits

Prevent ticket spam by limiting tickets per user.

### `max_tickets_per_user`
- **What it is:** Maximum number of open tickets a user can have at once
- **Example:** `5`
- **What happens:** If a user tries to create a 6th ticket, they'll get an error message
- **Recommended:** 3-5

---

## 🎨 Appearance Settings

Customize how the ticket panel looks.

### `ticket_embed`
- **What it is:** The visual appearance of the ticket creation panel
- **Sub-fields:**
  - `title`: Title of the panel
  - `description`: Description text users see
  - `color`: Color in hex format (e.g., `#0099ff`)

**Example:**
```json
"ticket_embed": {
  "title": "🎫 TicketFlow Support",
  "description": "Thank you for contacting our support team. Please describe your issue in detail.",
  "color": "#0099ff"
}
```

**Color Examples:**
- Blue: `#0099ff`
- Green: `#00aa00`
- Red: `#ff0000`
- Purple: `#9933ff`
- Gold: `#ffaa00`

---

## 🎭 Ticket Options

Define the categories/types of tickets users can create.

### Structure
```json
"ticket_options": [
  {
    "label": "General Support",
    "description": "For general questions and support.",
    "value": "general_support",
    "emoji": "❓"
  }
]
```

### Fields Explained

#### `label`
- The text shown in the dropdown menu
- Keep it short and clear (max ~25 characters)
- Example: `"General Support"`

#### `description`
- Detailed explanation shown when hovering
- Help users understand what this option is for
- Example: `"For general questions and support."`

#### `value`
- Internal identifier (used by the bot)
- Must be lowercase with underscores (no spaces)
- Example: `"general_support"`

#### `emoji`
- The emoji displayed next to the option
- Makes the dropdown more visually appealing
- Example: `"❓"`

### Default Options (Included)

| Option | Value | Emoji | Purpose |
|--------|-------|-------|---------|
| General Support | `general_support` | ❓ | General questions |
| Report a Bug | `bug_report` | 🐛 | Bug reports |
| Feature Request | `feature_request` | 💡 | Feature suggestions |
| Other | `other` | 📄 | Other inquiries |

### Adding Custom Options

You can add more options to the list:

```json
"ticket_options": [
  {
    "label": "Billing",
    "description": "Questions about billing and payments.",
    "value": "billing",
    "emoji": "💳"
  },
  {
    "label": "Technical",
    "description": "Technical issues and problems.",
    "value": "technical",
    "emoji": "⚙️"
  }
]
```

---

## 🔄 Complete Configuration Example

```json
{
  "discord_token": "YOUR_BOT_TOKEN_HERE",
  "client_id": "123456789012345678",
  "guild_id": "987654321098765432",
  "ticket_category_id": "1111111111111111111",
  "closed_ticket_category_id": "2222222222222222222",
  "log_channel_id": "3333333333333333333",
  "admin_role_id": "4444444444444444444",
  "support_team_role_id": "5555555555555555555",
  "auto_close_enabled": true,
  "auto_close_days": 7,
  "max_tickets_per_user": 5,
  "ticket_embed": {
    "title": "🎫 TicketFlow Support",
    "description": "Thank you for contacting our support team.",
    "color": "#0099ff"
  },
  "ticket_options": [
    {
      "label": "General Support",
      "description": "For general questions.",
      "value": "general_support",
      "emoji": "❓"
    }
  ]
}
```

---

## 🚀 Quick Setup Checklist

- [ ] Get your bot token from Discord Developer Portal
- [ ] Get your client_id from Discord Developer Portal
- [ ] Get your guild_id (server ID)
- [ ] Create 2 categories for tickets (open & closed)
- [ ] Create a channel for logs
- [ ] Create/identify roles for admin and support team
- [ ] Copy all IDs into config.json
- [ ] Customize appearance and options (optional)
- [ ] Run `node deploy-commands.js`
- [ ] Run `node index.js`
- [ ] Use `/ticket-setup #channel` to create the panel

---

## ❓ Troubleshooting

### Bot doesn't start
- Check that `discord_token` is correct
- Make sure you have a valid bot token

### Tickets not appearing in the right category
- Verify `ticket_category_id` is correct
- Make sure the bot has permission to create channels in that category

### Admin commands don't work
- Check that `admin_role_id` is correct
- Make sure you have that role assigned to your account

### Logs not appearing
- Verify `log_channel_id` is correct
- Make sure the bot has "Send Messages" permission in that channel

---

## 📚 Additional Resources

- [Discord.js Documentation](https://discord.js.org)
- [Discord Developer Portal](https://discord.com/developers)
- [TicketFlow GitHub](#)

---

**Last Updated:** November 23, 2025
**Version:** TicketFlow 1.0.0

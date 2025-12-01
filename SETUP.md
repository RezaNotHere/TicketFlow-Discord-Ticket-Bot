# 🚀 TicketFlow - Quick Setup Guide

Step-by-step guide to get TicketFlow running on your server.

## Prerequisites

- Node.js v16.9.0 or higher
- npm or yarn
- A Discord server where you have admin rights
- A Discord bot application

---

## Step 1: Create a Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Name your bot "TicketFlow" (or your preferred name)
4. Go to "Bot" section
5. Click "Add Bot"
6. Under TOKEN, click "Copy" (this is your `discord_token`)
7. Go to "OAuth2" → "URL Generator"
8. Select scopes: `bot`
9. Select permissions: `Send Messages`, `Manage Channels`, `Manage Messages`
10. Copy the generated URL and open it to invite your bot to your server

**Save your bot token safely!** ⚠️

---

## Step 2: Install TicketFlow

```bash
# Clone the repository
git clone <repository-url>
cd TicketAli

# Install dependencies
npm install
```

---

## Step 3: Get Your IDs

### Enable Developer Mode in Discord
1. Open Discord User Settings
2. Go to "App Settings" → "Advanced"
3. Enable "Developer Mode"

### Get the IDs You Need

**In Discord Developer Portal:**
- Copy `client_id` from General Information

**In Your Discord Server:**
- Right-click your server name → "Copy Server ID" → `guild_id`
- Create a category for tickets → Right-click → "Copy ID" → `ticket_category_id`
- Create a category for closed tickets → Right-click → "Copy ID" → `closed_ticket_category_id`
- Create a channel for logs → Right-click → "Copy ID" → `log_channel_id`
- Right-click admin role → "Copy ID" → `admin_role_id`
- Right-click support team role (optional) → "Copy ID" → `support_team_role_id`

---

## Step 4: Configure config.json

1. Copy `config.example.json` to `config.json`:
   ```bash
   cp config.example.json config.json
   ```

2. Open `config.json` in your text editor

3. Fill in all the IDs and token:
   ```json
   {
     "discord_token": "YOUR_BOT_TOKEN_HERE",
     "client_id": "123456789",
     "guild_id": "987654321",
     "ticket_category_id": "111111111",
     "closed_ticket_category_id": "222222222",
     "log_channel_id": "333333333",
     "admin_role_id": "444444444",
     "support_team_role_id": "555555555",
     ...
   }
   ```

**For detailed configuration help, see [CONFIG_GUIDE.md](./CONFIG_GUIDE.md)**

---

## Step 5: Deploy Commands

Before starting the bot, deploy slash commands:

```bash
node deploy-commands.js
```

You should see a success message.

---

## Step 6: Start the Bot

```bash
node index.js
```

You should see:
```
✅ Logged in as TicketFlow#0000
💻 Bot is ready!
```

---

## Step 7: Create Ticket Panel

In your Discord server:

1. Choose a channel where you want the ticket panel
2. Run: `/ticket-setup #channel`
3. The ticket creation panel will appear in that channel

---

## 🎉 You're Done!

Your TicketFlow bot is now running! Users can:
- Click the panel and select a ticket type
- Create support tickets
- Get support from your team

---

## Testing Your Setup

1. Create a test ticket as a regular user
2. Check that it appears in the correct category
3. Check that logs appear in your log channel
4. Test admin commands (claim, close, add user, etc.)

---

## Troubleshooting

### "Invalid token" error
- Make sure your bot token is correct and in `config.json`
- Don't include quotes around the token in JSON

### Bot doesn't respond to commands
- Make sure slash commands were deployed: `node deploy-commands.js`
- Check that bot has "Send Messages" permission

### Tickets appear in wrong category
- Verify `ticket_category_id` in `config.json`
- Make sure bot has permission to create channels there

### Logs not appearing
- Check `log_channel_id` is correct
- Make sure bot has "Send Messages" permission in log channel

### Can't find your IDs
- Make sure Developer Mode is enabled in Discord
- Right-click the server/channel/role and look for "Copy ID" option

---

## Running in Background (Optional)

### Using PM2 (Recommended)
```bash
npm install -g pm2
pm2 start index.js --name "TicketFlow"
pm2 save
pm2 startup
```

### Using screen (Linux/Mac)
```bash
screen -S ticketflow
node index.js
# Press Ctrl+A then D to detach
```

---

## Getting Help

- Check [CONFIG_GUIDE.md](./CONFIG_GUIDE.md) for configuration questions
- Review [LOGGING.md](./LOGGING.md) for logging information
- Check the main [README.md](./README.md) for features overview

---

## Security Tips

- ⚠️ Never share your `discord_token`
- Keep `config.json` out of version control (.gitignore it)
- Use strong role-based access control
- Regularly check logs for suspicious activity

---

**Happy ticketing! 🎫**

# 📚 TicketFlow Documentation Index

Welcome to TicketFlow! Here's a guide to all our documentation files.

## 🎯 Start Here

### New to TicketFlow?
👉 **Start with [SETUP.md](./SETUP.md)** - Complete step-by-step setup guide

### Need Configuration Help?
👉 **Check [CONFIG_GUIDE.md](./CONFIG_GUIDE.md)** - Detailed configuration reference

---

## 📖 Documentation Files

### [README.md](./README.md)
- Project overview
- Features list
- General information about TicketFlow
- Both English and Farsi versions

### [SETUP.md](./SETUP.md) - ⭐ START HERE
- Step-by-step installation guide
- How to get Discord IDs
- Configuration walkthrough
- First-time setup instructions
- Troubleshooting common issues

### [CONFIG_GUIDE.md](./CONFIG_GUIDE.md)
- Detailed explanation of every configuration option
- Where to find each ID
- How to customize appearance
- Example configurations
- Color reference guide
- Quick setup checklist

### [LOGGING.md](./LOGGING.md)
- How the logging system works
- What events are logged
- How to set up logging
- Log examples

---

## 🗂️ Project Structure

```
TicketAli/
├── index.js                 # Main bot file
├── logger.js               # Logging system
├── autoClose.js            # Auto-close functionality
├── deploy-commands.js      # Deploy slash commands
├── ticketCategoryManager.js # Ticket category management
├── config.json             # Your configuration (keep secret!)
├── config.example.json     # Example configuration
├── package.json            # Dependencies
├── commands/
│   └── ticket-setup.js    # Setup command
├── README.md              # Project overview
├── SETUP.md              # Installation guide
├── CONFIG_GUIDE.md       # Configuration reference
├── LOGGING.md            # Logging documentation
└── INDEX.md              # This file
```

---

## 🚀 Quick Setup

1. **Read**: [SETUP.md](./SETUP.md)
2. **Copy**: `config.example.json` → `config.json`
3. **Configure**: Fill in your IDs in `config.json` (see [CONFIG_GUIDE.md](./CONFIG_GUIDE.md))
4. **Deploy**: `node deploy-commands.js`
5. **Start**: `node index.js`

---

## 💡 Key Features

- ✅ Customizable ticket types
- ✅ Auto-closing inactive tickets
- ✅ Role-based permissions
- ✅ Comprehensive logging
- ✅ Ticket transcripts
- ✅ Multi-language support (English + Farsi)

---

## ❓ FAQ

### How do I customize ticket types?
See [CONFIG_GUIDE.md](./CONFIG_GUIDE.md) - Ticket Options section

### Where do I find my Discord IDs?
See [SETUP.md](./SETUP.md) - Step 3: Get Your IDs

### How do I enable logging?
See [LOGGING.md](./LOGGING.md) - Setup Logging section

### How do I add/remove users from tickets?
See [README.md](./README.md) - Features section

### My bot doesn't start, what do I do?
See [SETUP.md](./SETUP.md) - Troubleshooting section

---

## 🔒 Important Security Notes

- Never share your `discord_token` ⚠️
- Keep `config.json` private (it's in .gitignore)
- Use strong role-based access control
- Regularly review logs for suspicious activity

---

## 🔗 Useful Links

- [Discord Developer Portal](https://discord.com/developers)
- [Discord.js Documentation](https://discord.js.org)
- [TicketFlow GitHub](#)

---

## 📝 Version Info

- **Bot Name**: TicketFlow
- **Version**: 1.0.0
- **Framework**: Discord.js v14
- **Runtime**: Node.js 16.9.0+
- **Last Updated**: November 23, 2025

---

## 🤝 Need Help?

1. Check the relevant documentation file above
2. Look at [SETUP.md](./SETUP.md) troubleshooting section
3. Review [CONFIG_GUIDE.md](./CONFIG_GUIDE.md) for configuration issues
4. Check logs in your log channel for error details

---

**Choose your starting point above and happy ticketing! 🎫**

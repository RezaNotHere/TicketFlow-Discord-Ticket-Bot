# TicketFlow - Advanced Discord Ticket Bot

A powerful and highly configurable Discord ticket bot built with Discord.js v14. TicketFlow allows you to set up a professional ticket system in your server, with customizable ticket types, role-based permissions, and comprehensive management features.

## ✨ Features

- **🎫 Customizable Ticket Panel** - Create a ticket panel with dropdown menu of customizable ticket types
- **⚙️ Fully Configurable** - All settings managed through a single `config.json` file
- **🔒 Role-Based Permissions** - Control ticket management with dedicated admin and support team roles
- **📝 Ticket Transcripts** - Automatically generate and send transcripts when tickets are deleted
- **✨ Slash Commands** - Modern slash command interface for seamless user experience
- **🔐 Secure** - Bot token and sensitive data kept in ignored config file
- **⏱️ Auto-Close System** - Automatically close inactive tickets after configurable period
- **📊 Ticket Limits** - Set maximum tickets per user to prevent spam
- **📈 Comprehensive Logging** - Track all ticket events with color-coded embeds
- **🌍 Multi-Language Support** - Documentation in English and Farsi

## 📋 Prerequisites

- Node.js v16.9.0 or higher
- npm or yarn package manager
- Discord Bot Token from [Discord Developer Portal](https://discord.com/developers/applications)
- A Discord server where you have admin rights

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/RezaNotHere/Discord-Ticket-Bot
cd TicketAli
npm install
```

### 2. Configure

```bash
cp config.example.json config.json
```

Fill in your Discord IDs and token in `config.json`. **See [CONFIG_GUIDE.md](./CONFIG_GUIDE.md) for detailed help.**

### 3. Deploy & Start

```bash
node deploy-commands.js
node index.js
```

### 4. Create Ticket Panel

In your Discord server:
```
/ticket-setup #channel
```

For complete setup instructions, see **[SETUP.md](./SETUP.md)**

## ⚙️ Configuration Overview

The `config.json` file controls all bot settings:

### 🔐 Discord Credentials
```json
{
  "discord_token": "YOUR_BOT_TOKEN",
  "client_id": "YOUR_CLIENT_ID",
  "guild_id": "YOUR_SERVER_ID"
}
```

### 🎯 Channels & Categories
```json
{
  "ticket_category_id": "WHERE_NEW_TICKETS_APPEAR",
  "closed_ticket_category_id": "WHERE_CLOSED_TICKETS_GO",
  "log_channel_id": "WHERE_LOGS_ARE_SENT"
}
```

### 👥 Roles
```json
{
  "admin_role_id": "FULL_TICKET_MANAGEMENT",
  "support_team_role_id": "SUPPORT_TEAM_ROLE"
}
```

### ⏱️ Auto-Close
```json
{
  "auto_close_enabled": true,
  "auto_close_days": 7
}
```

### 📊 Limits
```json
{
  "max_tickets_per_user": 5
}
```

### 🎨 Appearance
```json
{
  "ticket_embed": {
    "title": "🎫 TicketFlow Support",
    "description": "Thank you for contacting us...",
    "color": "#0099ff"
  }
}
```

### 🎭 Ticket Types
```json
{
  "ticket_options": [
    {
      "label": "General Support",
      "description": "General questions",
      "value": "general_support",
      "emoji": "❓"
    }
  ]
}
```

**👉 For complete configuration guide, see [CONFIG_GUIDE.md](./CONFIG_GUIDE.md)**

## 💻 Commands

### `/ticket-setup` - Ticket Panel Setup
Creates an interactive ticket creation panel in your chosen channel.

**Usage:**
```
/ticket-setup #channel-name
```

**What it does:**
- Creates a ticket creation embed with a button
- Users click "Create Ticket" to open the ticket menu
- Select from your configured ticket types (Support, Bug Report, Billing, etc.)
- New tickets are created with proper naming and channel organization

**Requirements:**
- Admin role required
- Bot must have permissions in target channel
- Must be run in same server

**Example:**
```
/ticket-setup #ticket-creation
```

### 🔧 Admin Features

- **Claim Ticket**: Admins can claim tickets to show ownership
- **Add/Remove Users**: Add team members to specific tickets
- **Close Tickets**: Manually close with reason notes
- **Delete Tickets**: Permanently remove tickets
- **Auto-Close**: Automatic closure after inactivity period
- **Transcripts**: Generate and save ticket conversation history

### 📁 Project Structure

```
TicketAli/
├── index.js                 # Main bot file (781 lines)
├── logger.js               # Logging system (250 lines)
├── autoClose.js            # Auto-close functionality
├── ticketCategoryManager.js # Category management
├── deploy-commands.js      # Command registration
├── config.json             # User configuration (gitignored)
├── config.example.json     # Configuration template
├── package.json            # Dependencies & metadata
├── LICENSE                 # MIT License
├── README.md               # This file
├── SETUP.md                # Installation guide
├── CONFIG_GUIDE.md         # Configuration reference
├── LOGGING.md              # Logging documentation
└── commands/
    └── ticket-setup.js     # Ticket setup command
```

### 🔒 Security

1. **Configuration Security**
   - `config.json` is in `.gitignore` - never committed to repository
   - `config.example.json` provided as template for setup
   - Bot token safely stored in environment configuration

2. **Permission Control**
   - Admin roles required for ticket management
   - Role-based access control for all commands
   - Ticket channels have restricted visibility

3. **Data Protection**
   - Transcripts generated as HTML files
   - Log channel restricted to authorized users
   - No sensitive data logged to console

### 🤝 Contributing

To contribute improvements:

1. **Fork the Repository**
   - Create your own copy on GitHub

2. **Create Feature Branch**
   - `git checkout -b feature/your-feature`

3. **Make Your Changes**
   - Follow existing code style
   - Test thoroughly with your bot

4. **Commit & Push**
   - `git commit -m "Add your feature"`
   - `git push origin feature/your-feature`

5. **Submit Pull Request**
   - Describe your changes clearly
   - Link any related issues

### 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Complete installation & setup guide
- **[CONFIG_GUIDE.md](./CONFIG_GUIDE.md)** - Detailed configuration reference
- **[LOGGING.md](./LOGGING.md)** - Logging system documentation
- **[INDEX.md](./INDEX.md)** - Documentation index & FAQ

### 📝 License

This project is licensed under the **MIT License** - see [LICENSE](./LICENSE) file for details.

The MIT License allows you to:
- ✅ Use commercially
- ✅ Modify the code
- ✅ Distribute copies
- ✅ Use privately

**Requirement:** Include license notice in distributions.

### 🔗 Resources

- [Discord.js Documentation](https://discord.js.org)
- [Discord Developer Portal](https://discord.com/developers)
- [GitHub - discord-html-transcripts](https://github.com/ItsSpyce/discord-html-transcripts)

### 📞 Support

Need help? Check these resources:

1. **Documentation** - Read our guides (SETUP.md, CONFIG_GUIDE.md)
2. **GitHub Issues** - Report bugs or request features
3. **Discord Community** - Get help from community members

---

## 📊 Logging System

The bot includes a comprehensive logging system that records all important events in a dedicated Discord channel using color-coded embeds for easy tracking and monitoring.

### Logged Events

| Event | Color | Description |
|-------|-------|-------------|
| Bot Startup | 🟢 Green | Bot initialization and ready status |
| Ticket Created | 🔵 Blue | New ticket creation with type and reason |
| Ticket Closed | ⚫ Dark Grey | Ticket closure with close details |
| Ticket Deleted | 🔴 Red | Permanent ticket deletion |
| Ticket Claimed | 🟡 Yellow | Admin claiming responsibility for ticket |
| User Added | 🟢 Green | User added to ticket by admin |
| User Removed | 🟠 Orange | User removed from ticket |
| Transcript Generated | 🟣 Blurple | Ticket transcript creation |
| Command Executed | ⚙️ Greyple | Slash command execution |
| Setup Executed | 🔵 Blue | Ticket setup command execution |
| Auto-Close | 🟣 Purple | Automatic ticket closure due to inactivity |
| Errors | 🔴 Red | System errors with context |
| Warnings | 🟠 Orange | Non-critical warnings |

### Setup Logging

To enable the logging system:

1. Set the `log_channel_id` in your `config.json`:
   ```json
   "log_channel_id": "YOUR_LOG_CHANNEL_ID"
   ```

2. The log channel should be:
   - A text channel in your server
   - Accessible only by admins/moderators (recommended)
   - Bot has "Send Messages" permission

All logs will include timestamps, user information, and relevant context for complete tracking.

---

# 🇮🇷 راهنمای فارسی

## ✨ ویژگی‌ها

- 🎫 **سیستم تیکت کامل** - ایجاد، بستن و حذف تیکت‌ها
- 👨‍💼 **مدیریت ادمین** - کنترل کامل بر روی تیکت‌ها
- 📊 **سیستم لاگ پیشرفته** - تمام رویدادها در کانال لاگ
- ⏱️ **بستن خودکار** - بستن خودکار تیکت‌های فعال نیست
- 🎯 **انواع تیکت** - تعریف انواع تیکت سفارشی
- 📋 **رونوشت‌های تیکت** - ذخیره گفتگوهای تیکت
- 👥 **مدیریت کاربر** - افزودن/حذف کاربران از تیکت‌ها
- 🛡️ **کنترل نقش** - سیستم مبتنی بر نقش‌ها
- 🎨 **Embed رنگی** - پیام‌های زیبا و واضح
- 🔒 **امنیت بالا** - حفاظت از اطلاعات حساس

## 📋 پیش‌نیازها

قبل از شروع، این موارد را آماده کنید:

- **Node.js v16.9.0** یا بالاتر
- **حساب Discord** برای ایجاد ربات
- **Discord.js v14** (نصب خودکار با npm)
- **دانش پایه JavaScript** برای پیکربندی

## 🚀 شروع سریع

### 1️⃣ کلون و نصب
```bash
git clone https://github.com/RezaNotHere/Discord-Ticket-Bot
cd TicketAli
npm install
```

### 2️⃣ پیکربندی
```bash
cp config.example.json config.json
# سپس config.json را ویرایش کنید و اطلاعات خود را وارد کنید
```

### 3️⃣ استقرار دستورات
```bash
node deploy-commands.js
```

### 4️⃣ شروع ربات
```bash
node index.js
```

## ⚙️ بررسی پیکربندی

فایل `config.json` تمام تنظیمات ربات را کنترل می‌کند:

### 🔐 اعتبارات Discord
```json
{
  "discord_token": "توکن ربات شما",
  "client_id": "شناسه ربات شما",
  "guild_id": "شناسه سرور شما"
}
```

### 🎯 کانال‌ها و دسته‌بندی‌ها
```json
{
  "ticket_category_id": "دسته‌بندی تیکت‌های جدید",
  "closed_ticket_category_id": "دسته‌بندی تیکت‌های بسته شده",
  "log_channel_id": "کانال لاگ‌ها"
}
```

### 👥 نقش‌ها
```json
{
  "admin_role_id": "نقش مدیر",
  "support_team_role_id": "نقش تیم پشتیبانی"
}
```

### ⏱️ بستن خودکار
```json
{
  "auto_close_enabled": true,
  "auto_close_days": 7
}
```

### 📊 محدودیت‌ها
```json
{
  "max_tickets_per_user": 5
}
```

**👉 برای راهنمای پیکربندی کامل، [CONFIG_GUIDE.md](./CONFIG_GUIDE.md) را ببینید**

## 💻 دستورات

### `/ticket-setup` - راه‌اندازی پنل تیکت
پنل تیکت تعاملی را در کانال خود ایجاد می‌کند.

**نحوه استفاده:**
```
/ticket-setup #نام-کانال
```

**کار آن:**
- Embed ایجاد تیکت با دکمه ایجاد می‌کند
- کاربران روی "ایجاد تیکت" کلیک می‌کنند
- از انواع تیکت پیکربندی‌شده انتخاب می‌کنند
- تیکت جدید با نام و سازمان‌دهی صحیح ایجاد می‌شود

**الزامات:**
- نقش ادمین مورد نیاز است
- ربات باید مجوز لازم را در کانال داشته باشد
- باید در همان سرور اجرا شود

**مثال:**
```
/ticket-setup #ایجاد-تیکت
```

## 🔧 ویژگی‌های ادمین

- **درخواست تیکت**: ادمین‌ها می‌توانند تیکت را تحت نظارت بگیرند
- **افزودن/حذف کاربران**: افزودن اعضای تیم به تیکت‌های خاص
- **بستن تیکت**: بستن دستی با نکات توضیحی
- **حذف تیکت**: حذف دائم تیکت‌ها
- **بستن خودکار**: بستن خودکار پس از عدم فعالیت
- **رونوشت‌ها**: ایجاد و ذخیره تاریخچه گفتگو

## 📊 سیستم لاگ

ربات دارای یک سیستم لاگ جامع است که تمام رویدادهای مهم را در کانال Discord اختصاصی با embed‌های رنگی ثبت می‌کند.

### رویدادهای ثبت‌شده

| رویداد | رنگ | توضیح |
|-------|------|-------|
| راه‌اندازی ربات | 🟢 سبز | راه‌اندازی و آماده‌سازی |
| ایجاد تیکت | 🔵 آبی | تیکت جدید با نوع و دلیل |
| بستن تیکت | ⚫ خاکستری | بستن و جزئیات |
| حذف تیکت | 🔴 قرمز | حذف دائم تیکت |
| درخواست تیکت | 🟡 زرد | ادمین درخواست می‌کند |
| افزودن کاربر | 🟢 سبز | افزودن به تیکت |
| حذف کاربر | 🟠 نارنجی | حذف از تیکت |
| تولید رونوشت | 🟣 بنفش | رونوشت گفتگو |
| اجرای دستور | ⚙️ خاکستری | اجرای slash command |
| اجرای راه‌اندازی | 🔵 آبی | اجرای دستور راه‌اندازی |
| بستن خودکار | 🟣 بنفش | بستن خودکار |
| خطاها | 🔴 قرمز | خطاهای سیستم |
| هشدارها | 🟠 نارنجی | هشدارهای غیر بحرانی |

### راه‌اندازی لاگ

برای فعال‌کردن سیستم لاگ:

1. `log_channel_id` را در `config.json` تنظیم کنید:
   ```json
   "log_channel_id": "شناسه کانال لاگ شما"
   ```

2. کانال لاگ باید:
   - کانال متنی در سرور شما باشد
   - فقط برای ادمین‌ها/مدیران قابل دسترسی باشد (توصیه می‌شود)
   - ربات مجوز "ارسال پیام‌ها" داشته باشد

تمام لاگ‌ها شامل زمان، اطلاعات کاربر و متن کامل هستند.

## 📁 ساختار پروژه

```
TicketAli/
├── index.js                 # فایل اصلی ربات (781 خط)
├── logger.js               # سیستم لاگ (250 خط)
├── autoClose.js            # قابلیت بستن خودکار
├── ticketCategoryManager.js # مدیریت دسته‌بندی‌ها
├── deploy-commands.js      # ثبت دستورات
├── config.json             # پیکربندی کاربر (gitignored)
├── config.example.json     # الگو پیکربندی
├── package.json            # وابستگی‌ها و ابرداده
├── LICENSE                 # مجوز MIT
├── README.md               # این فایل
├── SETUP.md                # راهنمای نصب
├── CONFIG_GUIDE.md         # راهنمای پیکربندی
├── LOGGING.md              # مستندات سیستم لاگ
└── commands/
    └── ticket-setup.js     # دستور راه‌اندازی تیکت
```

## 🔒 امنیت

1. **امنیت پیکربندی**
   - `config.json` در `.gitignore` است - هرگز commit نمی‌شود
   - `config.example.json` برای راه‌اندازی فراهم شده است
   - توکن ربات در محیط امن ذخیره می‌شود

2. **کنترل مجوز**
   - نقش‌های ادمین برای مدیریت تیکت
   - کنترل دسترسی بر اساس نقش برای تمام دستورات
   - کانال‌های تیکت با دیدرسی محدود

3. **حفاظت داده‌ها**
   - رونوشت‌ها به صورت فایل HTML
   - کانال لاگ برای کاربران مجاز محدود شده
   - بدون ثبت داده‌های حساس در console

## 🤝 مشارکت

برای کمک به بهبود پروژه:

1. **Fork مخزن**
   - نسخه خود را در GitHub ایجاد کنید

2. **ایجاد شاخه ویژگی**
   - `git checkout -b feature/ویژگی-شما`

3. **انجام تغییرات**
   - از سبک کد موجود پیروی کنید
   - با ربات خود تست کنید

4. **Commit و Push**
   - `git commit -m "افزودن ویژگی شما"`
   - `git push origin feature/ویژگی-شما`

5. **ارسال Pull Request**
   - تغییرات را شرح دهید
   - مسائل مرتبط را لینک کنید

## 📚 مستندات

- **[SETUP.md](./SETUP.md)** - راهنمای نصب و راه‌اندازی
- **[CONFIG_GUIDE.md](./CONFIG_GUIDE.md)** - راهنمای پیکربندی
- **[LOGGING.md](./LOGGING.md)** - مستندات سیستم لاگ
- **[INDEX.md](./INDEX.md)** - فهرست مستندات و سؤالات متداول

## 📝 مجوز

این پروژه تحت مجوز **MIT** منتشر شده است - برای جزئیات [LICENSE](./LICENSE) را ببینید.

مجوز MIT به شما اجازه می‌دهد:
- ✅ استفاده تجاری
- ✅ ویرایش کد
- ✅ توزیع کپی‌ها
- ✅ استفاده خصوصی

**الزام:** شامل‌کردن متن مجوز در توزیع‌ها.

## 🔗 منابع

- [مستندات Discord.js](https://discord.js.org)
- [پورتال توسعه‌دهنده Discord](https://discord.com/developers)
- [GitHub - discord-html-transcripts](https://github.com/ItsSpyce/discord-html-transcripts)

## 📞 پشتیبانی

نیاز به کمک دارید؟ این منابع را بررسی کنید:

1. **مستندات** - راهنماهای ما را بخوانید (SETUP.md, CONFIG_GUIDE.md)
2. **GitHub Issues** - اشکالات را گزارش یا ویژگی‌ها را درخواست کنید
3. **جامعه Discord** - کمک از اعضای جامعه بگیرید

---

**شکریه برای استفاده از TicketFlow! 🎉**

### فعال‌سازی سیستم لاگ

برای فعال‌سازی سیستم لاگ:

1. `log_channel_id` را در `config.json` تنظیم کنید:
   ```json
   "log_channel_id": "YOUR_LOG_CHANNEL_ID"
   ```

2. کانال لاگ باید:
   - یک کانال متنی در سرور شما باشد
   - فقط برای ادمین‌ها/مدیران قابل دسترس باشد (توصیه شده)
   - ربات مجوز "ارسال پیام" داشته باشد

تمام لاگ‌ها شامل زمان، اطلاعات کاربر و جزئیات مربوطه برای پیگیری کامل هستند.

## Contributing

1.  Fork the repository
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

You are free to:
- ✅ Use this bot for commercial purposes
- ✅ Modify and distribute the code
- ✅ Use it in private or public projects
- ✅ Include it in your own projects

The only requirement is to include the original license notice.

---
# FA-فارسی

# ربات تیکت پیشرفته TicketFlow

ربات تیکتی قدرتمند و قابل‌تنظیم کاملی که بر اساس Discord.js v14 ساخته شده است. TicketFlow به شما امکان می‌دهد سیستم تیکتی حرفه‌ای در سرور خود راه‌اندازی کنید، با انواع تیکت‌های قابل‌تنظیم، مجوزهای مبتنی بر نقش، و امکانات مدیریت جامع.

## ویژگی‌ها

- **🎫 پنل تیکت قابل‌تنظیم:** یک پنل تیکت با منوی کشویی انواع تیکت‌های قابل‌تنظیم ایجاد کنید.
- **⚙️ کاملاً قابل‌تنظیم:** تمام تنظیمات از طریق یک فایل `config.json` مدیریت می‌شوند، که تنظیم ربات را آسان می‌کند.
- **🔒 مجوزهای مبتنی بر نقش:** با یک نقش ادمین اختصاصی و نقش تیم پشتیبانی، کنترل کنید چه کسی می‌تواند تیکت‌ها را مدیریت کند.
- **📝 رونوشت‌های تیکت:** هنگام حذف یک تیکت، به طور خودکار یک رونوشت برای کاربر ایجاد و ارسال کنید.
- **✨ دستورات Slash:** تمام دستورات به عنوان دستورات slash برای تجربه‌ای مدرن و کاربر دوست اجرا می‌شوند.
- **🔐 امن:** اطلاعات حساس مانند توکن ربات در فایل پیکربندی نگهداری می‌شود.
- **⏱️ سیستم خودکار بسته شدن:** تیکت‌های غیرفعال به طور خودکار پس از مدت زمان تعیین شده بسته می‌شوند.
- **📊 لیمیت تیکت:** تعیین حداکثر تعداد تیکتی که هر کاربر می‌تواند ایجاد کند، قابل تنظیم از طریق `config.json`.

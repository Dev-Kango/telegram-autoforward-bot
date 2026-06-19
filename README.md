# 🤖 Telegram AutoForward Bot

Automatically forward every post from one Telegram channel to multiple target channels — 24/7, hands-free.

---

## ✅ Requirements

- Node.js v18 or higher
- A Telegram Bot token (from [@BotFather](https://t.me/BotFather))
- Your Telegram User ID (from [@userinfobot](https://t.me/userinfobot))
- The bot added as **Admin** in all channels (source + targets)

---

## 🚀 Setup

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/telegram-autoforward-bot.git
cd telegram-autoforward-bot
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure the bot
```bash
cp .env.example .env
```
Open `.env` and fill in your values:
```
BOT_TOKEN=your_bot_token_here
OWNER_ID=your_telegram_user_id
SOURCE_CHANNEL=
TARGET_CHANNELS=
```

> **How to get channel IDs:** Forward any message from the channel to [@userinfobot](https://t.me/userinfobot) — it will show the channel ID.

### 4. Make the bot admin
- Add the bot to your **source channel** → make it Admin (needs "Post Messages" permission)
- Add the bot to every **target channel** → make it Admin (needs "Post Messages" permission)

### 5. Start the bot
```bash
npm start
```

---

## 💬 Bot Commands

| Command | Description |
|---|---|
| `/start` | Welcome message |
| `/status` | View status, uptime & total forwarded |
| `/channels` | List all target channels |
| `/add @channel` | Add a new target channel |
| `/remove @channel` | Remove a target channel |
| `/pause` | Pause forwarding |
| `/resume` | Resume forwarding |
| `/help` | Show all commands |

> Only the bot owner (your `OWNER_ID`) can run management commands.

---

## ☁️ Deployment Options

### Option 1 — Pterodactyl Panel
1. Create a Node.js egg
2. Upload all files
3. Set environment variables in the Startup tab
4. Click Start

### Option 2 — Railway (Free tier)
1. Push code to GitHub
2. Connect repo on [railway.app](https://railway.app)
3. Add environment variables
4. Deploy

### Option 3 — Replit
1. Import the GitHub repo
2. Add `.env` values in the Secrets tab
3. Run `npm start`

### Option 4 — VPS (Ubuntu)
```bash
npm install -g pm2
pm2 start index.js --name autoforward-bot
pm2 save
pm2 startup
```

---

## 📁 Project Structure

```
telegram-autoforward-bot/
├── index.js        ← Entry point, starts the bot
├── config.js       ← Loads and validates .env
├── forwarder.js    ← Core forwarding logic
├── commands.js     ← Bot command handlers
├── assets/
│   └── welcome.png ← Image shown on /start
├── .env.example    ← Config template
├── .gitignore
└── README.md
```

---

## 📄 License

MIT — free to use and modify.

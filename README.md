# TelegramSS

A simple screenshot capture tool that sends screenshots directly to Telegram with just a keyboard shortcut. Can also process screenshot requests with gemini API

## Features

-  **Quick Screenshot** - Press Ctrl+Z to capture and send instantly
-  **Telegram Integration** - Screenshots sent directly to your Telegram bot
-  **Request Numbering** - Each batch gets a unique request number
-  **Local Storage** - All data stored on your machine

## Quick Start

1. **Create a Telegram Bot:**
   - Open @BotFather on Telegram
   - Send `/newbot` and follow instructions
   - Copy the bot token

2. **Get Your Chat ID:**
   - Start a chat with your new bot
   - Open @userinfobot to get your Chat ID

3. **Configure the App:**
   - Open the app and go to Settings
   - Enable Telegram Integration
   - Enter your Bot Token and Chat ID
   - Save

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+Z | Take screenshot & send to Telegram |
| Ctrl+B | Toggle window visibility |
| Ctrl+H | Take screenshot (add to queue) |
| Ctrl+L | Delete last screenshot |

## Setup

```bash
# Install dependencies
npm install

# Run in development
npm run dev

# Build for production
npm run package-win
```

## Tech Stack

- Electron
- React
- TypeScript
- Vite

## License

MIT

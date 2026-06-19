require('dotenv').config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const OWNER_ID = process.env.OWNER_ID;
const SOURCE_CHANNEL = process.env.SOURCE_CHANNEL;
const TARGET_CHANNELS = process.env.TARGET_CHANNELS
  ? process.env.TARGET_CHANNELS.split(',').map((c) => c.trim()).filter(Boolean)
  : [];

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN is missing in your .env file');
  process.exit(1);
}
if (!OWNER_ID) {
  console.error('❌ OWNER_ID is missing in your .env file');
  process.exit(1);
}
if (!SOURCE_CHANNEL) {
  console.error('❌ SOURCE_CHANNEL is missing in your .env file');
  process.exit(1);
}

module.exports = {
  BOT_TOKEN,
  OWNER_ID: parseInt(OWNER_ID, 10),
  SOURCE_CHANNEL: SOURCE_CHANNEL.trim(),
  TARGET_CHANNELS,
};

const { Telegraf } = require('telegraf');
const config = require('./config');
const forwarder = require('./forwarder');
const commands = require('./commands');

const bot = new Telegraf(config.BOT_TOKEN);

forwarder.init(config.TARGET_CHANNELS);

commands.register(bot);

bot.on('channel_post', async (ctx) => {
  const chatId = ctx.chat.id.toString();
  const chatUsername = ctx.chat.username ? `@${ctx.chat.username}` : '';
  if (chatId !== config.SOURCE_CHANNEL && chatUsername !== config.SOURCE_CHANNEL) return;

  try {
    const result = await forwarder.forwardMessage(ctx, bot);
    if (result?.succeeded !== undefined) {
      console.log(`✅ Forwarded to ${result.succeeded} channel(s) — ${result.failed} failed`);
    }
  } catch (err) {
    console.error('❌ Forward error:', err.message);
  }
});

bot
  .launch()
  .then(() => {
    console.log('');
    console.log('🤖 AutoForward Bot is running!');
    console.log(`📡 Source channel : ${config.SOURCE_CHANNEL}`);
    console.log(
      `🎯 Target channels: ${config.TARGET_CHANNELS.length > 0 ? config.TARGET_CHANNELS.join(', ') : 'None — use /add to add some'}`
    );
    console.log('');
  })
  .catch((err) => {
    console.error('❌ Failed to start bot:', err.message);
    process.exit(1);
  });

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

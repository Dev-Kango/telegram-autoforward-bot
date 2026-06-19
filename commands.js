const path = require('path');
const { Markup } = require('telegraf');
const config = require('./config');
const forwarder = require('./forwarder');

const startTime = Date.now();

function isOwner(ctx) {
  return ctx.from && ctx.from.id === config.OWNER_ID;
}

function formatUptime() {
  const ms = Date.now() - startTime;
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

const mainKeyboard = Markup.inlineKeyboard([
  [
    Markup.button.callback('📊 Status', 'status'),
    Markup.button.callback('📋 Channels', 'channels'),
  ],
  [
    Markup.button.callback('➕ Add Channel', 'add'),
    Markup.button.callback('🗑 Remove Channel', 'remove'),
  ],
  [
    Markup.button.callback('⏸ Pause', 'pause'),
    Markup.button.callback('▶️ Resume', 'resume'),
  ],
  [
    Markup.button.callback('❓ Help', 'help'),
  ],
]);

const welcomeCaption = [
  '🚀 *AutoForward Bot — Active & Ready!*',
  '',
  'Your posts will be automatically forwarded from your source channel to all target channels — instantly, 24/7.',
  '',
  '_Tap a button below to manage your bot:_',
].join('\n');

async function showStatus(ctx) {
  if (!isOwner(ctx)) return ctx.answerCbQuery('⛔ Owner only', { show_alert: true });

  const targets = forwarder.getTargets();
  const paused = forwarder.getPaused();
  const total = forwarder.getTotalForwarded();

  await ctx.reply(
    [
      '📊 *Bot Status*',
      '',
      `State: ${paused ? '⏸ Paused' : '✅ Running'}`,
      `Source: \`${config.SOURCE_CHANNEL}\``,
      `Targets: ${targets.length} channel(s)`,
      `Forwarded: ${total} message(s)`,
      `Uptime: ${formatUptime()}`,
    ].join('\n'),
    { parse_mode: 'Markdown' }
  );
}

async function showChannels(ctx) {
  if (!isOwner(ctx)) return ctx.answerCbQuery('⛔ Owner only', { show_alert: true });

  const targets = forwarder.getTargets();

  if (targets.length === 0) {
    await ctx.reply(
      '📭 No target channels yet.\n\nTap ➕ *Add Channel* or send:\n`/add @channelname`',
      { parse_mode: 'Markdown' }
    );
  } else {
    const list = targets.map((c, i) => `${i + 1}. \`${c}\``).join('\n');
    await ctx.reply(`📋 *Target Channels (${targets.length}):*\n\n${list}`, {
      parse_mode: 'Markdown',
    });
  }
}

function register(bot) {
  bot.command('start', async (ctx) => {
    try {
      await ctx.replyWithPhoto(
        { source: path.join(__dirname, 'assets', 'welcome.png') },
        { caption: welcomeCaption, parse_mode: 'Markdown', ...mainKeyboard }
      );
    } catch {
      await ctx.reply(welcomeCaption, { parse_mode: 'Markdown', ...mainKeyboard });
    }
  });

  bot.action('status', async (ctx) => {
    await ctx.answerCbQuery();
    await showStatus(ctx);
  });

  bot.action('channels', async (ctx) => {
    await ctx.answerCbQuery();
    await showChannels(ctx);
  });

  bot.action('add', async (ctx) => {
    await ctx.answerCbQuery();
    if (!isOwner(ctx)) return ctx.reply('⛔ Unauthorized — only the bot owner can use this.');
    await ctx.reply(
      [
        '➕ *Add a Target Channel*',
        '',
        'Send the command with the channel:',
        '`/add @channelname`',
        'or',
        '`/add -100xxxxxxxxxx`',
        '',
        '_Make sure the bot is already admin in that channel._',
      ].join('\n'),
      { parse_mode: 'Markdown' }
    );
  });

  bot.action('remove', async (ctx) => {
    await ctx.answerCbQuery();
    if (!isOwner(ctx)) return ctx.reply('⛔ Unauthorized — only the bot owner can use this.');

    const targets = forwarder.getTargets();
    if (targets.length === 0) {
      return ctx.reply('📭 No target channels to remove.');
    }

    const list = targets.map((c, i) => `${i + 1}. \`${c}\``).join('\n');
    await ctx.reply(
      [
        '🗑 *Remove a Target Channel*',
        '',
        '*Current targets:*',
        list,
        '',
        'Send the command with the channel to remove:',
        '`/remove @channelname`',
        'or',
        '`/remove -100xxxxxxxxxx`',
      ].join('\n'),
      { parse_mode: 'Markdown' }
    );
  });

  bot.action('pause', async (ctx) => {
    await ctx.answerCbQuery();
    if (!isOwner(ctx)) return ctx.reply('⛔ Unauthorized — only the bot owner can use this.');
    forwarder.pause();
    await ctx.reply('⏸ *Forwarding paused.*\n\nTap ▶️ Resume or send /resume to start again.', {
      parse_mode: 'Markdown',
    });
  });

  bot.action('resume', async (ctx) => {
    await ctx.answerCbQuery();
    if (!isOwner(ctx)) return ctx.reply('⛔ Unauthorized — only the bot owner can use this.');
    forwarder.resume();
    await ctx.reply('▶️ *Forwarding resumed!*\n\nAll new posts will be forwarded again.', {
      parse_mode: 'Markdown',
    });
  });

  bot.action('help', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply(
      [
        '🤖 *AutoForward Bot — Help*',
        '',
        '📊 *Status* — View bot status, uptime & message count',
        '📋 *Channels* — List all active target channels',
        '➕ *Add Channel* — Add a new channel to forward to',
        '🗑 *Remove Channel* — Remove a channel from the list',
        '⏸ *Pause* — Stop forwarding temporarily',
        '▶️ *Resume* — Start forwarding again',
        '',
        '_You can also type commands directly:_',
        '`/status` `/channels` `/add` `/remove` `/pause` `/resume`',
      ].join('\n'),
      { parse_mode: 'Markdown' }
    );
  });

  bot.command('status', async (ctx) => {
    await showStatus(ctx);
  });

  bot.command('channels', async (ctx) => {
    await showChannels(ctx);
  });

  bot.command('add', async (ctx) => {
    if (!isOwner(ctx)) return ctx.reply('⛔ Unauthorized — only the bot owner can use this.');
    const parts = ctx.message.text.split(' ');
    const channel = parts[1]?.trim();
    if (!channel) {
      return ctx.reply('⚠️ Usage: `/add @channelname` or `/add -100xxxxxxxxxx`', {
        parse_mode: 'Markdown',
      });
    }
    const added = forwarder.addTarget(channel);
    if (added) {
      await ctx.reply(`✅ Added \`${channel}\` to target channels.`, { parse_mode: 'Markdown' });
    } else {
      await ctx.reply(`⚠️ \`${channel}\` is already in the list.`, { parse_mode: 'Markdown' });
    }
  });

  bot.command('remove', async (ctx) => {
    if (!isOwner(ctx)) return ctx.reply('⛔ Unauthorized — only the bot owner can use this.');
    const parts = ctx.message.text.split(' ');
    const channel = parts[1]?.trim();
    if (!channel) {
      return ctx.reply('⚠️ Usage: `/remove @channelname` or `/remove -100xxxxxxxxxx`', {
        parse_mode: 'Markdown',
      });
    }
    const removed = forwarder.removeTarget(channel);
    if (removed) {
      await ctx.reply(`🗑 Removed \`${channel}\` from target channels.`, {
        parse_mode: 'Markdown',
      });
    } else {
      await ctx.reply(`⚠️ \`${channel}\` was not found in the list.`, { parse_mode: 'Markdown' });
    }
  });

  bot.command('pause', async (ctx) => {
    if (!isOwner(ctx)) return ctx.reply('⛔ Unauthorized — only the bot owner can use this.');
    forwarder.pause();
    await ctx.reply('⏸ Forwarding paused.\n\nUse /resume to start again.');
  });

  bot.command('resume', async (ctx) => {
    if (!isOwner(ctx)) return ctx.reply('⛔ Unauthorized — only the bot owner can use this.');
    forwarder.resume();
    await ctx.reply('▶️ Forwarding resumed! All new posts will be forwarded again.');
  });

  bot.command('help', async (ctx) => {
    await ctx.reply(
      [
        '🤖 *AutoForward Bot — Commands*',
        '',
        '/start — Welcome message & buttons',
        '/status — Bot status, uptime & stats',
        '/channels — List all target channels',
        '/add @ch — Add a new target channel',
        '/remove @ch — Remove a target channel',
        '/pause — Pause forwarding',
        '/resume — Resume forwarding',
        '/help — Show this menu',
      ].join('\n'),
      { parse_mode: 'Markdown' }
    );
  });
}

module.exports = { register };

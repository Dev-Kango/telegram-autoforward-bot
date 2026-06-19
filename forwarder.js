let isPaused = false;
let targetChannels = [];
let totalForwarded = 0;

function init(channels) {
  targetChannels = [...channels];
}

function getTargets() {
  return [...targetChannels];
}

function addTarget(channel) {
  if (!targetChannels.includes(channel)) {
    targetChannels.push(channel);
    return true;
  }
  return false;
}

function removeTarget(channel) {
  const index = targetChannels.indexOf(channel);
  if (index > -1) {
    targetChannels.splice(index, 1);
    return true;
  }
  return false;
}

function pause() {
  isPaused = true;
}

function resume() {
  isPaused = false;
}

function getPaused() {
  return isPaused;
}

function getTotalForwarded() {
  return totalForwarded;
}

async function forwardMessage(ctx, bot) {
  if (isPaused) return { skipped: true };
  if (targetChannels.length === 0) return { skipped: true, reason: 'no targets' };

  const sourceChatId = ctx.chat.id.toString();
  const messageId = ctx.channelPost.message_id;

  const results = await Promise.allSettled(
    targetChannels.map((channel) =>
      bot.telegram.forwardMessage(channel, sourceChatId, messageId)
    )
  );

  const succeeded = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected');

  totalForwarded += succeeded;

  if (failed.length > 0) {
    failed.forEach((f) => console.error('Forward failed:', f.reason?.message));
  }

  return { succeeded, failed: failed.length };
}

module.exports = {
  init,
  getTargets,
  addTarget,
  removeTarget,
  pause,
  resume,
  getPaused,
  getTotalForwarded,
  forwardMessage,
};

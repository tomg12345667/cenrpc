const { PermissionFlagsBits } = require('discord.js');
const { getConfig } = require('../database');
const { logAction } = require('../utils/modlog');

// Simple in-memory tracker for anti-spam (messages per user per channel window).
const spamTracker = new Map(); // key: `${guildId}-${userId}` -> [timestamps]
const SPAM_WINDOW_MS = 6000;
const SPAM_MESSAGE_LIMIT = 6;

const INVITE_REGEX = /(discord\.gg|discord(?:app)?\.com\/invite)\/[a-zA-Z0-9-]+/i;
const LINK_REGEX = /https?:\/\/\S+/i;

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot || !message.guild) return;

    const config = getConfig(message.guild.id).automod;
    if (!config.enabled && !config.antiLink && !config.antiSpam) return;

    // Never moderate members with ManageMessages (assume trusted staff).
    if (message.member?.permissions.has(PermissionFlagsBits.ManageMessages)) return;

    // ---- Word filter ----
    if (config.enabled && config.bannedWords.length > 0) {
      const content = message.content.toLowerCase();
      const hit = config.bannedWords.find((w) => content.includes(w));
      if (hit) {
        await message.delete().catch(() => {});
        await logAction(message.guild, {
          action: 'Automod: Blocked Word',
          target: message.author,
          moderator: message.client.user,
          reason: `Message contained a filtered word/phrase`,
        });
        return;
      }
    }

    // ---- Anti-link ----
    if (config.antiLink && (INVITE_REGEX.test(message.content) || LINK_REGEX.test(message.content))) {
      await message.delete().catch(() => {});
      await logAction(message.guild, {
        action: 'Automod: Blocked Link',
        target: message.author,
        moderator: message.client.user,
        reason: 'Message contained a link/invite',
      });
      return;
    }

    // ---- Anti-spam ----
    if (config.antiSpam) {
      const key = `${message.guild.id}-${message.author.id}`;
      const now = Date.now();
      const timestamps = (spamTracker.get(key) || []).filter((t) => now - t < SPAM_WINDOW_MS);
      timestamps.push(now);
      spamTracker.set(key, timestamps);

      if (timestamps.length > SPAM_MESSAGE_LIMIT) {
        spamTracker.set(key, []);
        const member = message.member;
        if (member?.moderatable) {
          await member.timeout(5 * 60 * 1000, 'Automod: spamming').catch(() => {});
          await logAction(message.guild, {
            action: 'Automod: Anti-Spam Timeout',
            target: message.author,
            moderator: message.client.user,
            reason: 'Sent messages too quickly',
            extra: '5 minute timeout applied',
          });
        }
      }
    }
  },
};

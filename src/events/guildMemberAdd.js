const { getConfig } = require('../database');
const { logAction } = require('../utils/modlog');

const NEW_ACCOUNT_THRESHOLD_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const config = getConfig(member.guild.id);
    if (!config.automod.enabled) return;

    const accountAge = Date.now() - member.user.createdTimestamp;
    if (accountAge < NEW_ACCOUNT_THRESHOLD_MS) {
      // Flag it in the mod log rather than auto-punishing — false positives
      // (new but legitimate accounts) are common, so a human should decide.
      await logAction(member.guild, {
        action: 'Automod: New Account Flag',
        target: member.user,
        moderator: member.client.user,
        reason: 'Account is less than 3 days old',
        extra: `Created <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
      });
    }
  },
};

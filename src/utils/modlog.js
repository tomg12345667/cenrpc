const { EmbedBuilder } = require('discord.js');
const { getConfig, addCase } = require('../database');
const { modLogEmbed, COLORS } = require('./embeds');

/**
 * Records a moderation action as a case, posts it to the guild's mod-log
 * channel (/mod-log-set or /setmodlog), and — if configured — posts a public
 * summary to the "shame corner" channel (/shame-corner-set).
 */
async function logAction(guild, { action, target, moderator, reason, extra }) {
  const caseData = addCase(guild.id, {
    userId: target?.id,
    moderatorId: moderator?.id,
    action,
    reason,
  });

  const config = getConfig(guild.id);

  if (config.modLogChannelId) {
    const channel = guild.channels.cache.get(config.modLogChannelId);
    if (channel && channel.isTextBased()) {
      const embed = modLogEmbed({ action, target, moderator, reason, extra, caseId: caseData.id });
      channel.send({ embeds: [embed] }).catch(() => {});
    }
  }

  if (config.shameCornerChannelId) {
    const channel = guild.channels.cache.get(config.shameCornerChannelId);
    if (channel && channel.isTextBased()) {
      const targetLabel = target?.tag ?? target?.username ?? String(target ?? 'Unknown');
      const modLabel = moderator?.tag ?? moderator?.username ?? String(moderator ?? 'Unknown');
      const embed = new EmbedBuilder()
        .setColor(COLORS.warning)
        .setTitle(`🚨 ${action}`)
        .setDescription(`**${targetLabel}** got hit with a **${action}**.`)
        .addFields(
          { name: 'Reason', value: reason || 'No reason provided' },
          { name: 'Handled by', value: modLabel }
        )
        .setFooter({ text: `Case #${caseData.id}` })
        .setTimestamp();
      channel.send({ embeds: [embed] }).catch(() => {});
    }
  }

  return caseData;
}

module.exports = { logAction };

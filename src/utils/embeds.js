const { EmbedBuilder } = require('discord.js');

const COLORS = {
  success: 0x57f287,
  error: 0xed4245,
  warning: 0xfee75c,
  info: 0x5865f2,
  neutral: 0x2b2d31,
};

function baseEmbed(color) {
  return new EmbedBuilder().setColor(color).setTimestamp();
}

function successEmbed(title, description) {
  return baseEmbed(COLORS.success).setTitle(`✅ ${title}`).setDescription(description || null);
}

function errorEmbed(title, description) {
  return baseEmbed(COLORS.error).setTitle(`❌ ${title}`).setDescription(description || null);
}

function warningEmbed(title, description) {
  return baseEmbed(COLORS.warning).setTitle(`⚠️ ${title}`).setDescription(description || null);
}

function infoEmbed(title, description) {
  return baseEmbed(COLORS.info).setTitle(`ℹ️ ${title}`).setDescription(description || null);
}

function modLogEmbed({ action, target, moderator, reason, extra, caseId }) {
  const embed = baseEmbed(COLORS.neutral)
    .setTitle(`${action}${caseId ? ` — Case #${caseId}` : ''}`)
    .addFields(
      { name: 'User', value: target ? `${target.tag ?? target} (${target.id ?? ''})` : 'Unknown', inline: true },
      { name: 'Moderator', value: moderator ? `${moderator.tag ?? moderator} (${moderator.id ?? ''})` : 'Unknown', inline: true },
      { name: 'Reason', value: reason || 'No reason provided' }
    );
  if (extra) embed.addFields({ name: 'Details', value: extra });
  return embed;
}

module.exports = { COLORS, successEmbed, errorEmbed, warningEmbed, infoEmbed, modLogEmbed };

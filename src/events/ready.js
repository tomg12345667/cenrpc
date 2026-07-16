const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log(`📋 Loaded ${client.commands.size} slash commands`);
    client.user.setPresence({
      activities: [{ name: `${client.commands.size} mod commands | /help`, type: ActivityType.Watching }],
      status: 'online',
    });
  },
};

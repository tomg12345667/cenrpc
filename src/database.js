// Tiny file-based database. No external DB needed — good for small/medium servers.
// Everything is stored in data/db.json and kept in memory for fast access.

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function defaultData() {
  return {
    guilds: {}, // guildId -> { config: {...}, warnings: [...], cases: [...], caseCounter: 0 }
  };
}

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData(), null, 2));
  }
}

ensureFile();
let cache = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

function save() {
  fs.writeFileSync(DB_FILE, JSON.stringify(cache, null, 2));
}

function ensureGuild(guildId) {
  if (!cache.guilds[guildId]) {
    cache.guilds[guildId] = {
      config: {
        modLogChannelId: null,
        shameCornerChannelId: null,
        muteRoleId: null,
        automod: {
          enabled: false,
          bannedWords: [],
          antiLink: false,
          antiSpam: false,
        },
      },
      warnings: [],
      cases: [],
      caseCounter: 0,
    };
    save();
  }
  return cache.guilds[guildId];
}

// ---------- Config ----------
function getConfig(guildId) {
  return ensureGuild(guildId).config;
}

function setConfig(guildId, partial) {
  const g = ensureGuild(guildId);
  g.config = { ...g.config, ...partial };
  save();
  return g.config;
}

function setAutomod(guildId, partial) {
  const g = ensureGuild(guildId);
  g.config.automod = { ...g.config.automod, ...partial };
  save();
  return g.config.automod;
}

// ---------- Warnings ----------
function addWarning(guildId, userId, moderatorId, reason) {
  const g = ensureGuild(guildId);
  const warning = {
    id: g.warnings.length + 1,
    userId,
    moderatorId,
    reason,
    timestamp: Date.now(),
  };
  g.warnings.push(warning);
  save();
  return warning;
}

function getWarnings(guildId, userId) {
  const g = ensureGuild(guildId);
  return g.warnings.filter((w) => w.userId === userId);
}

function clearWarnings(guildId, userId) {
  const g = ensureGuild(guildId);
  const count = g.warnings.filter((w) => w.userId === userId).length;
  g.warnings = g.warnings.filter((w) => w.userId !== userId);
  save();
  return count;
}

function removeWarning(guildId, warningId) {
  const g = ensureGuild(guildId);
  const before = g.warnings.length;
  g.warnings = g.warnings.filter((w) => w.id !== Number(warningId));
  save();
  return before !== g.warnings.length;
}

// ---------- Mod cases (ban/kick/timeout/etc history) ----------
function addCase(guildId, { userId, moderatorId, action, reason }) {
  const g = ensureGuild(guildId);
  g.caseCounter += 1;
  const modCase = {
    id: g.caseCounter,
    userId,
    moderatorId,
    action,
    reason: reason || 'No reason provided',
    timestamp: Date.now(),
  };
  g.cases.push(modCase);
  save();
  return modCase;
}

function getCases(guildId, userId) {
  const g = ensureGuild(guildId);
  return g.cases.filter((c) => c.userId === userId);
}

function getCase(guildId, caseId) {
  const g = ensureGuild(guildId);
  return g.cases.find((c) => c.id === Number(caseId));
}

module.exports = {
  getConfig,
  setConfig,
  setAutomod,
  addWarning,
  getWarnings,
  clearWarnings,
  removeWarning,
  addCase,
  getCases,
  getCase,
};

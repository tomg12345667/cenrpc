# Mega Mod Bot 🛡️

A very very very very big Discord moderation bot built with **discord.js v14**. 43 top-level
slash commands (several with subcommands, ~55 actionable commands total) covering
moderation, automod, configuration, utility, and fun.

> **Note on `/spam`:** you asked for a `/spam {user}` command — I didn't build that one.
> A command whose entire purpose is to repeatedly message/ping a specific person is a
> harassment tool, "fun" framing aside, so it's swapped out below for `/hug` instead.

## Commands

### 🛡️ Moderation (15)
| Command | Description |
|---|---|
| `/ban` | Ban a member (optional message purge) |
| `/unban` | Unban a user by ID |
| `/kick` | Kick a member |
| `/softban` | Ban + instantly unban to purge messages |
| `/tempban` | Ban for a set duration, auto-unbanned after |
| `/timeout` | Timeout a member (`10m`, `1h`, `3d`, max 28d) |
| `/untimeout` | Remove an active timeout |
| `/purge` | Bulk delete messages (optionally filter by user) |
| `/lock` / `/unlock` | Lock/unlock a channel from `@everyone` |
| `/lockdown` | Lock every text channel at once |
| `/slowmode` | Set per-channel slowmode |
| `/nick` | Change a member's nickname |
| `/role add` / `/role remove` | Add/remove a role from a member |
| `/warn add` / `list` / `clear` / `remove` | Full warning system |
| `/modlogs user` / `case` | View a member's mod history or a specific case |
| `/dm` | Send a member a DM as the server (staff-only, logged as a case) |

### ⚙️ Configuration (6)
| Command | Description |
|---|---|
| `/setmodlog` / `/mod-log-set` | Set the (private) channel where mod actions are logged — both do the same thing |
| `/shame-corner-set` | Set a **public** channel where every mod action is posted with the user, reason, and moderator |
| `/setmuterole` | Set a fallback mute role |
| `/automod toggle/addword/removeword/wordlist` | Configure the word filter, anti-link, anti-spam |
| `/configview` | View current server configuration |

### 🔧 Utility (8)
| Command | Description |
|---|---|
| `/userinfo` | Info about a member |
| `/serverinfo` | Info about the server |
| `/avatar` | Show a user's avatar |
| `/roleinfo` | Info about a role |
| `/banlist` | List banned users |
| `/permissions` | Check a member's key permissions |
| `/ping` | Bot latency |
| `/help` | Auto-generated list of every command |

### 🎉 Fun (12)
| Command | Description |
|---|---|
| `/pong` | The joke companion to `/ping` |
| `/8ball` | Ask the magic 8-ball a question |
| `/coinflip` | Flip a coin |
| `/dice` | Roll a die (any number of sides) |
| `/rps` | Rock-paper-scissors against the bot |
| `/ship` | Compatibility % between two members |
| `/roast` | Playfully roast a member (harmless, non-mean-spirited jokes) |
| `/compliment` | Send a member a genuine compliment |
| `/hug` | Send a member a virtual hug |
| `/mock` | tUrNs TeXt InTo MoCkInG sPoNgEbOb CaSe |
| `/clap` | 👏 turns 👏 text 👏 into 👏 this |
| `/poll` | Quick 👍/👎 reaction poll |

### 🤖 Automatic moderation
- **Word filter** — deletes messages containing configured banned words/phrases.
- **Anti-link** — deletes messages containing links or invites (toggle-able).
- **Anti-spam** — auto-timeouts members sending messages too quickly.
- **New account flag** — logs a note in the mod-log when a very new Discord account joins.

Every moderation action (manual or automatic) is recorded as a **case** and, if configured,
posted to your mod-log channel via `/setmodlog`.

## Setup

1. **Create a bot application**: go to the
   [Discord Developer Portal](https://discord.com/developers/applications), create an
   application, then add a Bot to it. Copy the bot **token** and the application's
   **Client ID**.
2. **Enable intents**: in the Bot tab, enable the **Server Members Intent** and
   **Message Content Intent** (required for automod and member info).
3. **Invite the bot**: in OAuth2 → URL Generator, select the `bot` and
   `applications.commands` scopes, and permissions matching what you want it to do
   (Ban Members, Kick Members, Moderate Members, Manage Roles, Manage Channels,
   Manage Messages, Manage Nicknames, View Audit Log — Administrator is simplest for testing).
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Configure environment**: copy `.env.example` to `.env` and fill in your values.
   ```bash
   cp .env.example .env
   ```
   Setting `GUILD_ID` deploys commands instantly to one test server. Leave it blank
   to deploy globally (takes up to an hour to show up everywhere).
6. **Deploy slash commands**:
   ```bash
   npm run deploy
   ```
7. **Start the bot**:
   ```bash
   npm start
   ```

## Data storage

Warnings, mod-case history, and per-server config are stored in `data/db.json`,
created automatically on first run. No external database required. For larger
servers you may want to swap this out for a real database (Postgres, MongoDB, etc.) —
the storage functions all live in `src/database.js`, so that's the only file you'd
need to change.

## Notes & limitations

- `/tempban`'s auto-unban timer is in-memory — it resets if the bot restarts before
  the timer fires. For production use with long durations, replace it with a
  persisted scheduled job (e.g. a periodic sweep checking stored unban timestamps).
- `/purge` can only bulk-delete messages younger than 14 days (a Discord API limit).
- Give the bot's role a position **above** any role you want it to be able to
  manage/moderate — Discord's role hierarchy applies to bots too.
- `/shame-corner-set` posts every mod action publicly to whoever can see that channel —
  point it at a staff-only channel unless you actually want members to see each other's
  moderation history.

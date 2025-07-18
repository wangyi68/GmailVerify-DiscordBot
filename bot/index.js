// ──────────────── Dependencies ────────────────
import {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes,
  readdirSync,
  dotenv,
  ActivityType,
  MessageFlags
} from '../config/dependencies.js';

import { log } from '../utils/logger.js';

dotenv.config();

export const startBot = async () => {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers
    ]
  });

  client.commands = new Collection();
  const commands = [];
  const commandFiles = readdirSync('./commands').filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = await import(`../commands/${file}`);
    const cmd = command.default;
    client.commands.set(cmd.data.name, cmd);
    commands.push(cmd.data.toJSON());
  }

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try {
    log.info('📡 Deploying slash commands...');
    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: commands }
    );
    log.success(`✅ Successfully deployed ${commands.length} commands.`);
  } catch (error) {
    log.error('❌ [BOT] Failed to deploy slash commands: ' + error);
  }

  client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      log.command(interaction.commandName, interaction.user);
      await command.execute(interaction);
    } catch (err) {
      log.error(`❌ [BOT] Error executing /${interaction.commandName}: ${err.message}`);
      try {
        if (interaction.deferred || interaction.replied) {
          await interaction.followUp({
            content: '❌ An unexpected error occurred.',
            flags: MessageFlags.Ephemeral
          });
        } else {
          await interaction.reply({
            content: '❌ An unexpected error occurred.',
            flags: MessageFlags.Ephemeral
          });
        }
      } catch (e) {
        log.error('❌ Follow-up error: ' + e.message);
      }
    }
  });

  client.once('ready', () => {
    log.success(`✅ Logged in as ${client.user.tag}`);

    const activities = process.env.BOT_ACTIVITIES.split(',').map(s => s.trim());
    const status = [
      {
        name: 'Bailu',
        type: ActivityType.Streaming,
        url: 'https://www.youtube.com/watch?v=z0lirtctZGk'
      },
      {
        name: 'Chenduling',
        type: ActivityType.Streaming,
        url: 'https://www.youtube.com/watch?v=z0lirtctZGk'
      },
      {
        name: 'JuJingYi',
        type: ActivityType.Streaming,
        url: 'https://www.youtube.com/watch?v=z0lirtctZGk'
      }
    ];

    function setRandomPresence() {
      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      const randomStatus = status[Math.floor(Math.random() * status.length)];
      client.user.setPresence({
        activities: [{
          name: randomActivity,
          type: randomStatus.type,
          url: randomStatus.url
        }],
        status: 'idle'
      });
    }

    setRandomPresence();
    setInterval(setRandomPresence, 3000);
  });

  try {
    log.info('🔑 Logging in bot...');
    await client.login(process.env.DISCORD_TOKEN);
    log.success('✅ Bot logged in successfully.');
  } catch (e) {
    log.error('❌ Bot login failed: ' + e.message);
  }
};

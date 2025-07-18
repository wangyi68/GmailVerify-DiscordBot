// commands/link.js
import {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  MessageFlags
} from 'discord.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { log } from '../utils/logger.js';
import ora from 'ora';
// Xử lý __dirname trong ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đường dẫn tuyệt đối tới ngrok.json
const ngrokPath = path.join(__dirname, '../json/ngrok.json');

// Mặc định dùng localhost nếu không có ngrok
let ngrokURL = 'http://localhost:3000';

try {
  const cache = JSON.parse(fs.readFileSync(ngrokPath, 'utf-8'));

  if (cache.ngrokUrl) {
    ngrokURL = cache.ngrokUrl;
    log.success(`✅ Loaded ngrok URL: ${ngrokURL}`);
  } else {
    log.warn('⚠️ ngrok.json thiếu trường "ngrokUrl". Fallback to localhost.');
  }
} catch (err) {
  log.error('❌ Không thể đọc file ngrok.json. Fallback to localhost.');
}


export default {
  data: new SlashCommandBuilder()
    .setName('link')
    .setDescription('🔗 Connect your Discord account with Gmail for verification'),

  async execute(interaction) {

    const embed = new EmbedBuilder()
      .setColor('#3b82f6')
      .setTitle('🔐 Link Your Gmail with Discord')
      .setThumbnail('https://cdn-icons-png.flaticon.com/512/732/732200.png')
      .setDescription([
        '📧 **Secure your account and gain server access by linking your email.**',
        '',
        '✨ Simple • Fast • Secure',
        '',
        '👉 **Click the button below to start the verification process!**'
      ].join('\n'))
      .setFooter({
        text: '🔒 Discord Verification System',
        iconURL: interaction.client.user.displayAvatarURL()
      })
      .setTimestamp();

    const button = new ButtonBuilder()
      .setLabel('🔗 Link Now')
      .setStyle(ButtonStyle.Link)
      .setURL(`${ngrokURL}/auth/discord`);

    const row = new ActionRowBuilder().addComponents(button);

    return interaction.reply({
      embeds: [embed],
      components: [row],
      flags: MessageFlags.Ephemeral
    });
  }
};
// This command allows users to link their Discord account with their Gmail for verification purposes.
// It provides a button that redirects them to a verification page hosted on ngrok or localhost.
// The command is designed to be ephemeral, meaning only the user who invoked it can see the response.
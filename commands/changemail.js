import {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags
} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { log } from '../utils/logger.js';

// Lấy __dirname vì dùng ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đường dẫn tuyệt đối đến ngrok.json
const ngrokPath = path.join(__dirname, '../json/ngrok.json');

// Mặc định là localhost
let ngrokURL = 'http://localhost:3000';

try {
  const cache = JSON.parse(fs.readFileSync(ngrokPath, 'utf-8'));

  if (cache.ngrokUrl) {
    ngrokURL = cache.ngrokUrl;
    log.success(`✅ Loaded verification URL: ${ngrokURL}`);
  } else {
    console.warn('⚠️ Missing `ngrokUrl` in ngrok.json. Using localhost.');
  }
} catch (err) {
  console.error('❌ Failed to read ngrok.json. Fallback to localhost.');
}


export default {
  data: new SlashCommandBuilder()
    .setName('changemail')
    .setDescription('✉️ Change your linked Gmail address by re-verifying'),

  async execute(interaction) {

    const embed = new EmbedBuilder()
      .setColor('#fbbf24')
      .setTitle('✉️ Change Linked Gmail')
      .setDescription([
        '🔄 **You can change your Gmail by going through the verification process again!**',
        '👇 Click the button or open the link below to continue.',
        '',
        `🔗 **[Click here to change Gmail](${ngrokURL}/auth/discord)**`
      ].join('\n'))
      .setThumbnail('https://cdn-icons-png.flaticon.com/512/732/732200.png')
      .setFooter({
        text: '✉️ Discord Verification System',
        iconURL: interaction.client.user.displayAvatarURL()
      })
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral
    });
  }
};

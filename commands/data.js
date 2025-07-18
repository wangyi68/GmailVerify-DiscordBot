import {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
  MessageFlags
} from 'discord.js';

import fs from 'fs';
import { Parser } from 'json2csv';
import dotenv from 'dotenv';
import User from '../models/User.js';
import { log } from '../utils/logger.js';

dotenv.config();

export default {
  data: new SlashCommandBuilder()
    .setName('export')
    .setDescription('📤 Export all user verification data (Owner only)'),

  async execute(interaction) {
    const userId = interaction.user.id;
    if (userId !== process.env.BOT_OWNER_ID) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('Red')
            .setTitle('🚫 Access Denied')
            .setDescription('Only the bot owner can use this command.')
        ],
        flags: MessageFlags.Ephemeral
      });
    }

    try {
      const users = await User.find().lean();

      const jsonPath = './data.json';
      const csvPath = './data.csv';

      // Write JSON
      fs.writeFileSync(jsonPath, JSON.stringify(users, null, 2));

      // Write CSV
      const fields = ['discordId', 'email', 'verified', 'code', 'sentAt', 'expiresAt'];
      const parser = new Parser({ fields });
      const csv = parser.parse(users);
      fs.writeFileSync(csvPath, csv);

      const embed = new EmbedBuilder()
        .setColor('#00b894')
        .setTitle('📤 Export Completed')
        .setDescription(`✅ **Successfully exported ${users.length} users!**`)
        .addFields(
          { name: '📁 JSON File', value: '`data.json`', inline: true },
          { name: '📊 CSV File', value: '`data.csv`', inline: true }
        )
        .setThumbnail('https://cdn-icons-png.flaticon.com/512/5968/5968756.png')
        .setFooter({
          text: '📤 Discord Verification System',
          iconURL: interaction.client.user.displayAvatarURL()
        })
        .setTimestamp();

      await interaction.reply({
        embeds: [embed],
        files: [
          new AttachmentBuilder(jsonPath, { name: 'data.json' }),
          new AttachmentBuilder(csvPath, { name: 'data.csv' })
        ],
        flags: MessageFlags.Ephemeral
      });

      // Delete files after sending
      fs.unlinkSync(jsonPath);
      fs.unlinkSync(csvPath);
      log.info('🧹 Temporary files deleted after export.');
    } catch (error) {
      log.error(`Export failed: ${error.message}`);
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('DarkRed')
            .setTitle('❌ Export Failed')
            .setDescription('Check the console for details.')
        ],
        flags: MessageFlags.Ephemeral
      });
    }
  }
};

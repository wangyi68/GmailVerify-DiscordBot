import {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags
} from 'discord.js';
import User from '../models/User.js';
import VerifyCode from '../models/VerifyCode.js';
import dotenv from 'dotenv';
import { log } from '../utils/logger.js';
dotenv.config();

export default {
  data: new SlashCommandBuilder()
    .setName('cleardata')
    .setDescription('🧹 Permanently delete all user emails and verification codes (Owner only)'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const isOwner = userId === process.env.BOT_OWNER_ID;

   

    if (!isOwner) {
      log.error(`[cleardata] Unauthorized access by ${interaction.user.tag}`);
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#ef4444')
            .setTitle('🚫 Access Denied')
            .setDescription('❌ **Only the bot owner can use this command.**')
            .setThumbnail('https://cdn-icons-png.flaticon.com/512/601/601239.png')
            .setFooter({
              text: 'Access Denied • Discord Verification System',
              iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp()
        ],
        flags: MessageFlags.Ephemeral
      });
    }

    try {
      const deletedUsers = await User.deleteMany({});
      const deletedCodes = await VerifyCode.deleteMany({});

      log.success(`[cleardata] Deleted ${deletedUsers.deletedCount} users and ${deletedCodes.deletedCount} codes`);

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#e74c3c')
            .setTitle('🧹 Database Cleared')
            .setDescription('🗑️ **All user emails and verification codes have been permanently deleted!**')
            .addFields(
              { name: '📧 Emails Deleted', value: `**${deletedUsers.deletedCount}**`, inline: true },
              { name: '🔐 Codes Deleted', value: `**${deletedCodes.deletedCount}**`, inline: true }
            )
            .setThumbnail('https://cdn-icons-png.flaticon.com/512/601/601239.png')
            .setFooter({
              text: '⚠️ This action is irreversible! | Discord Verification System',
              iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp()
        ],
        flags: MessageFlags.Ephemeral
      });
    } catch (error) {
      log.error(`[cleardata] Failed to clear database: ${error.message}`);
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#ef4444')
            .setTitle('❌ Failed to Clear Database')
            .setDescription('⚠️ **An error occurred while clearing the database. Please check the console or verify MongoDB connection.**')
            .setFooter({
              text: 'Database Error • Discord Verification System',
              iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp()
        ],
        flags: MessageFlags.Ephemeral
      });
    }
  }
};

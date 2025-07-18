// commands/reset.js
import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import User from '../models/User.js';
import { log } from '../utils/logger.js';
import dotenv from 'dotenv';
dotenv.config();


export default {
  data: new SlashCommandBuilder()
    .setName('reset')
    .setDescription('♻️ Unlink your Gmail and remove all your verification data'),

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
    // Chỉ reset dữ liệu đã xác minh (verified: true)
    const user = await User.findOne({ discordId: userId, verified: true });

    if (!user) {
      log.error(`[reset] No verified data found for ${interaction.user.tag}`);
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#ef4444')
            .setTitle('❌ No Verified Gmail')
            .setDescription('🔍 **You have not verified any Gmail yet!**\nUse `/link` to start the verification process.')
            .setThumbnail('https://cdn-icons-png.flaticon.com/512/463/463612.png')
            .setFooter({
              text: 'No Verified Gmail • Discord Verification System',
              iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp()
        ],
        flags: MessageFlags.Ephemeral
      });
    }

    try {
      await User.deleteOne({ discordId: userId, verified: true });
      log.success(`[reset] Deleted verified data for ${interaction.user.tag}`);

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#3b82f6')
            .setTitle('♻️ Gmail Unlinked & Verified Data Cleared')
            .setDescription('🧹 **Your verified Gmail and all verification data have been removed from our system!**\nYou can restart the process anytime using `/link`.')
            .setThumbnail('https://cdn-icons-png.flaticon.com/512/463/463612.png')
            .setFooter({
              text: 'Verified Data Cleared • Discord Verification System',
              iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp()
        ],
        flags: MessageFlags.Ephemeral
      });
    } catch (err) {
      log.error(`[reset] Error while deleting verified data for ${interaction.user.tag}: ${err.message}`);
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#ef4444')
            .setTitle('❌ Reset Failed')
            .setDescription('⚠️ **An error occurred while trying to clear your verified data. Please try again later.**')
            .setFooter({
              text: 'Reset Error • Discord Verification System',
              iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp()
        ],
        flags: MessageFlags.Ephemeral
      });
    }
  }
};

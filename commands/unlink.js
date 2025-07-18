
import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import User from '../models/User.js';
import { log } from '../utils/logger.js';

  export default {
    data: new SlashCommandBuilder()
      .setName('unlink')
      .setDescription('🗑️ Remove your Gmail from the verification system'),

    async execute(interaction) {
      const userId = interaction.user.id;
     

      const user = await User.findOne({ discordId: userId });

      if (!user || !user.email) {
        log.error(`No email found to unlink for ${interaction.user.tag}`);
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#ef4444')
              .setTitle('❌ No Linked Email Found')
              .setDescription('You haven’t linked any Gmail account yet. Use `/link` to get started.')
              .setThumbnail('https://cdn-icons-png.flaticon.com/512/732/732200.png')
              .setFooter({
                text: 'Discord Verification System',
                iconURL: interaction.client.user.displayAvatarURL()
              })
              .setTimestamp()
          ],
          flags: MessageFlags.Ephemeral
        });
      }

      await User.deleteOne({ discordId: userId });
      log.success(`Unlinked email ${user.email} for ${interaction.user.tag}`);

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#6366f1')
            .setTitle('🗑️ Gmail Unlinked Successfully')
            .setDescription(`🗑️ **The email \`${user.email}\` has been removed from your account.**`)
            .addFields({
              name: '🔗 Want to link again?',
              value: 'Use `/link` to link a new Gmail address.',
              inline: false
            })
            .setThumbnail('https://cdn-icons-png.flaticon.com/512/732/732200.png')
            .setFooter({
              text: '🗑️ Discord Verification System',
              iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp()
        ],
        flags: MessageFlags.Ephemeral
      });
    }
  };

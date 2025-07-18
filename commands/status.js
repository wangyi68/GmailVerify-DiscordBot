import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import User from '../models/User.js';
import { log } from '../utils/logger.js';

export default {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('� View your Gmail verification status and details'),

  async execute(interaction) {
   

    const userId = interaction.user.id;
    let user;
    try {
      user = await User.findOne({ discordId: userId });
    } catch (err) {
      log.error(`[status] Database error for ${interaction.user.tag}: ${err.message}`);
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#ef4444')
            .setTitle('❌ Database Error')
            .setDescription('⚠️ Unable to fetch your status. Please try again later.')
            .setFooter({
              text: 'Database Error • Discord Verification System',
              iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp()
        ],
        flags: MessageFlags.Ephemeral
      });
    }

    if (!user?.email) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#ef4444')
            .setTitle('❌ No Gmail Linked')
            .setDescription('🔗 Use `/link` to connect your Gmail account first.')
            .setThumbnail('https://cdn-icons-png.flaticon.com/512/5968/5968756.png')
            .setFooter({
              text: 'Discord Verification System',
              iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp()
        ],
        flags: MessageFlags.Ephemeral
      });
    }

    const expired = user.expiresAt && Date.now() > new Date(user.expiresAt).getTime();

    const fields = [
      { name: '📧 Email Linked', value: `\`${user.email}\``, inline: false },
      {
        name: '✅ Verification Status',
        value: user.verified ? '🟢 **Verified**' : '🟠 **Not Verified**',
        inline: false
      }
    ];

    if (!user.verified && user.expiresAt) {
      fields.push({
        name: expired ? '⚠️ Expired At' : '⏰ Expires At',
        value: new Date(user.expiresAt).toLocaleString('en-US'),
        inline: false
      });
    }


    const embed = new EmbedBuilder()
      .setColor(user.verified ? '#22c55e' : expired ? '#f43f5e' : '#facc15')
      .setTitle('📋 Gmail Verification Status')
      .setDescription(user.verified
        ? '✅ **Your account is verified!**'
        : expired
          ? '⏰ **Your verification expired. Please verify again.**'
          : '🟠 **Not verified yet.**'
      )
      .addFields(fields)
      .setThumbnail('https://cdn-icons-png.flaticon.com/512/5968/5968756.png')
      .setFooter({
        text: user.verified ? '✅ Discord Verification System' : expired ? '⏰ Discord Verification System' : '🟠 Discord Verification System',
        iconURL: interaction.client.user.displayAvatarURL()
      })
      .setTimestamp();

    return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }
};

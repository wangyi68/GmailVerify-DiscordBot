import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { log } from '../utils/logger.js';

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('🆘 Quick help and command list for GmailVerify Bot'),

  async execute(interaction) {

    const embed = new EmbedBuilder()
      .setColor('#38bdf8')
      .setTitle('🆘 GmailVerify Bot Help')
      .setDescription('Here are the main commands you can use:')
      .addFields(
        { name: '🔗 /link', value: 'Link your Gmail to Discord', inline: false },
        { name: '✉️ /verify', value: 'Send a 6-digit code to your Gmail', inline: false },
        { name: '🔑 /auth <code>', value: 'Verify your account with the code', inline: false },
        { name: '🔁 /resend', value: 'Resend the latest verification code', inline: false },
        { name: '♻️ /reset', value: 'Unlink your Gmail and clear your data', inline: false },
        { name: '🗑️ /unlink', value: 'Remove your Gmail from the system', inline: false },
        { name: '📊 /status', value: 'Check your verification status', inline: false },
        { name: '📘 /guide', value: 'View the full usage guide (multi-language)', inline: false },
        { name: '🧹 /cleardata', value: 'Delete all user data (Owner only)', inline: false },
        { name: '📤 /export', value: 'Export all user data (Owner only)', inline: false }
      )
      .setFooter({
        text: 'GmailVerify Bot • For more details, use /guide',
        iconURL: interaction.client.user.displayAvatarURL()
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral
    });
  }
};

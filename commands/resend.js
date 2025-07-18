// commands/resend.js

import { log } from '../utils/logger.js';
import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import User from '../models/User.js';
import chalk from 'chalk';

dotenv.config();

// ✉️ Mail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export default {
  data: new SlashCommandBuilder()
    .setName('resend')
    .setDescription('� Resend the latest verification code to your Gmail'),

  async execute(interaction) {

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const userId = interaction.user.id;
    const user = await User.findOne({ discordId: userId });

    if (!user?.email || !user?.code || Date.now() > user.expiresAt) {
      log.error(`[resend] Invalid or expired code for ${interaction.user.tag}`);
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor('#f97316')
            .setTitle('⚠️ Code Not Available or Expired')
            .setDescription('⌛ **Your code is invalid or expired!**\nUse `/verify` to generate a new code and try again.')
            .setThumbnail('https://cdn-icons-png.flaticon.com/512/732/732200.png')
            .setFooter({
              text: '⚠️ Discord Verification System',
              iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp()
        ],
        flags: MessageFlags.Ephemeral
      });
    }

    // ✅ Resend email
await transporter.sendMail({
  from: `Discord Verify Bot <${process.env.EMAIL_USER}>`,
  to: user.email,
  subject: '🔁 Your Discord Verification Code',
  html: `
  <div style="font-family: 'Segoe UI', sans-serif; max-width: 520px; margin: auto; background: #1e293b; border: 1px solid #3b82f6; border-radius: 12px; padding: 24px; color: #ffffff;">
    <div style="text-align: center;">
      <img src="https://cdn-icons-png.flaticon.com/512/5968/5968756.png" alt="Discord Logo" width="64" style="margin-bottom: 16px;" />
      <h2 style="color: #3b82f6;">🔁 Verification Code (Resent)</h2>
      <p style="font-size: 16px; color: #cbd5e1;">This is your updated verification code:</p>

      <div style="font-size: 28px; font-weight: bold; background: #60a5fa; color: #1e293b; padding: 14px 28px; border-radius: 10px; display: inline-block; margin: 20px 0;">
        ${user.code}
      </div>

      <p style="font-size: 14px; color: #cbd5e1;">⏰ Expires at: <strong>${new Date(user.expiresAt).toLocaleString('vi-VN')}</strong></p>

      <hr style="margin: 24px 0; border: none; border-top: 1px solid #3b82f6;" />

      <p style="font-size: 12px; color: #94a3b8;">If you didn’t request this code, you can safely ignore this email.</p>
      <p style="font-size: 12px; color: #94a3b8;">— Discord Verification System</p>
    </div>
  </div>
  `
});


    console.log(chalk.green(`[RESEND] ${interaction.user.tag} ✅ Resent code to ${user.email}`));

    return interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor('#4ade80') // green-400
          .setTitle('📨 Verification Code Resent')
          .setThumbnail('https://cdn-icons-png.flaticon.com/512/5968/5968756.png')
          .setDescription([
            `📧 Sent to: \`${user.email}\``,
          ].join('\n'))
          .addFields(
            {
              name: '⏰ Valid Until',
              value: new Date(user.expiresAt).toLocaleString('vi-VN'),
              inline: true
            },
            {
              name: '📥 Next Step',
              value: 'Use `/auth <code>` to verify',
              inline: true
            }
          )
          .setFooter({
            text: 'Current code is still valid',
            iconURL: interaction.client.user.displayAvatarURL()
          })
          .setTimestamp()
      ],
      flags: MessageFlags.Ephemeral
    });
  }
};

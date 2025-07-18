// commands/verify.js

import { log } from '../utils/logger.js';
import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import User from '../models/User.js'
import chalk from 'chalk';;

dotenv.config();

function randomLetters(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function randomNumbers(length) {
  const nums = '0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += nums.charAt(Math.floor(Math.random() * nums.length));
  }
  return result;
}

function generateCodeByFormat(formatType) {
  switch (formatType) {
    case '1':
      // Ví dụ: OWKS-0293-WOAM-029384
      return `${randomLetters(4)}-${randomNumbers(4)}-${randomLetters(4)}-${randomNumbers(6)}`;

    case '2':
      // Ví dụ: 384923984239 (12 số ngẫu nhiên)
      return randomNumbers(12);

    case '3':
      // Ví dụ: 0393-0293-0293
      return `${randomNumbers(4)}-${randomNumbers(4)}-${randomNumbers(4)}`;
    case '4':
      // Ví dụ: 123456
      return randomNumbers(6);
    default:
      return 'Invalid format';
  }
}
const format = process.env.CODE_FORMAT || '1';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export default {
  data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('✉️ Send a 6-digit verification code to your linked Gmail address'),

  async execute(interaction) {
   
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const userId = interaction.user.id;
    const user = await User.findOne({ discordId: userId });

    if (!user?.email) {
      log.error(`[verify] No email linked for ${interaction.user.tag}`);
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor('#ef4444')
            .setTitle('❌ No Gmail Linked')
            .setDescription([
              'You have not linked any Gmail address yet!',
              '🔗 **Use `/link` to connect your Gmail and start the verification process.**'
            ].join('\n'))
            .setThumbnail('https://cdn-icons-png.flaticon.com/512/732/732200.png')
            .setFooter({
              text: 'No Gmail Linked • Discord Verification',
              iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp()
        ],
        flags: MessageFlags.Ephemeral
      });
    }

    const now = Date.now();
    if (user.sentAt && now - new Date(user.sentAt).getTime() < 60_000) {
      const wait = Math.ceil((60_000 - (now - new Date(user.sentAt).getTime())) / 1000);
      log.info(`[verify] ${interaction.user.tag} must wait ${wait}s before requesting new code.`);
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor('#fbbf24')
            .setTitle('⏳ Cooldown Active')
            .setDescription([
              `⏰ **Please wait ${wait} seconds before requesting a new code!**`,
              '🚦 Avoid spamming the verification system.'
            ].join('\n'))
            .setThumbnail('https://cdn-icons-png.flaticon.com/512/732/732200.png')
            .setFooter({
              text: 'Cooldown • Discord Verification',
              iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp()
        ],
        flags: MessageFlags.Ephemeral
      });
    }

    const code =  generateCodeByFormat(format);

    await User.updateOne({ discordId: userId }, {
      code,
      verified: false,
      sentAt: new Date(now),
      expiresAt: new Date(now + 5 * 60_000)
    });

    // Send Email
    await transporter.sendMail({
  from: `Discord Verify Bot <${process.env.EMAIL_USER}>`,
  to: user.email,
  subject: '🔐 Your Discord Verification Code',
  html: `
  <div style="font-family: 'Segoe UI', sans-serif; max-width: 520px; margin: auto; background: #1e293b; border: 1px solid #3b82f6; border-radius: 12px; padding: 24px; color: #ffffff;">
    <div style="text-align: center;">
      <img src="https://cdn-icons-png.flaticon.com/512/5968/5968756.png" alt="Discord Logo" width="64" style="margin-bottom: 16px;" />
      <h2 style="color: #3b82f6;">🔐 Your Verification Code</h2>
      <p style="font-size: 16px; color: #cbd5e1;">Use the code below to verify your Discord account:</p>

      <div style="font-size: 28px; font-weight: bold; background: #60a5fa; color: #1e293b; padding: 14px 28px; border-radius: 10px; display: inline-block; margin: 20px 0;">
        ${code}
      </div>

      <p style="font-size: 14px; color: #cbd5e1;">⏰ Expires at: <strong>${new Date(now + 5 * 60 * 1000).toLocaleString('vi-VN')}</strong></p>

      <hr style="margin: 24px 0; border: none; border-top: 1px solid #3b82f6;" />

      <p style="font-size: 12px; color: #94a3b8;">If you didn’t request this code, you can safely ignore this email.</p>
      <p style="font-size: 12px; color: #94a3b8;">— Discord Verification System</p>
    </div>
  </div>
  `
});


    console.log(chalk.green(`📨 Verification code sent to: ${user.email}`));
    return interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor('#7c3aed')
          .setTitle('📨 Gmail Verification Code Sent!')
          .setThumbnail('https://cdn-icons-png.flaticon.com/512/5968/5968756.png')
          .setDescription([
            '✅ **A 6-digit code has been sent to your Gmail:**',
            `> ${user.email}`,
            '',
            '📬 *Check your inbox or spam folder.*'
          ].join('\n'))
          .addFields(
            {
              name: '⏳ Expires In',
              value: '`5 minutes`',
              inline: true
            },
            {
              name: '🔑 Next Step',
              value: 'Use `/auth <your_code>` to complete verification.',
              inline: true
            }
          )
          .setFooter({
            text: 'Gmail Verification • Discord System',
            iconURL: interaction.client.user.displayAvatarURL()
          })
          .setTimestamp()
      ],
      flags: MessageFlags.Ephemeral
    });
  }
};

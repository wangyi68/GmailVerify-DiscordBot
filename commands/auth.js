
import { log } from '../utils/logger.js';
import {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags
} from 'discord.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();
const VERIFIED_ROLE_ID = process.env.ROLE;

export default {
  data: new SlashCommandBuilder()
    .setName('auth')
    .setDescription('🔑 Authenticate your Gmail account with a 6-digit code')
    .addStringOption(option =>
      option.setName('code')
        .setDescription('Enter the 6-digit verification code sent to your Gmail')
        .setRequired(true)
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const codeInput = interaction.options.getString('code');
    const username = interaction.user.username;



    const user = await User.findOne({ discordId: userId });

    if (!user || !user.code) {
      log.error(`[auth] Code not found for ${interaction.user.tag}`);
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#ef4444')
            .setTitle('❌ No Code Found')
            .setDescription('🔑 **Please run the `/verify` command first to receive a code!**')
            .setThumbnail('https://cdn-icons-png.flaticon.com/512/5610/5610944.png')
            .setFooter({
              text: '❌ Discord Verification System',
              iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp()
        ],
        flags: MessageFlags.Ephemeral
      });
    }

    if (user.verified) {
      log.info(`[auth] ${interaction.user.tag} already verified.`);
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#22c55e')
            .setTitle('✅ Already Verified')
            .setDescription(`🎉 **Hey ${username}, your account is already verified!**`)
            .setThumbnail('https://cdn-icons-png.flaticon.com/512/5610/5610944.png')
            .setFooter({
              text: '✅ Discord Verification System',
              iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp()
        ],
        flags: MessageFlags.Ephemeral
      });
    }

    if (Date.now() > user.expiresAt) {
      log.error(`[auth] Verification code expired for ${interaction.user.tag}`);
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#fbbf24')
            .setTitle('⏰ Code Expired')
            .setDescription('⌛ **Your verification code has expired!**\nPlease run `/verify` to request a new one.')
            .setThumbnail('https://cdn-icons-png.flaticon.com/512/5610/5610944.png')
            .setFooter({
              text: '⏰ Discord Verification System',
              iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp()
        ],
        flags: MessageFlags.Ephemeral
      });
    }

    if (codeInput === user.code) {
      await User.updateOne({ discordId: userId }, { verified: true, code: null, sentAt: null, expiresAt: null });

      try {
        const member = await interaction.guild.members.fetch(userId);
        await member.roles.add(VERIFIED_ROLE_ID);

        log.success(`[auth] ${interaction.user.tag} verified successfully.`);

        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#3b82f6')
              .setTitle('🎉 Verification Successful')
              .setDescription(`🎊 **Welcome, ${username}! You have been verified and assigned the verified role.**`)
              .setThumbnail('https://cdn-icons-png.flaticon.com/512/5610/5610944.png')
              .setFooter({
                text: '🎉 Discord Verification System',
                iconURL: interaction.client.user.displayAvatarURL()
              })
              .setTimestamp()
          ],
          flags: MessageFlags.Ephemeral
        });
      } catch (err) {
        log.error(`[auth] Failed to assign role: ${err.message}`);
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#eab308')
              .setTitle('⚠️ Verified but Role Failed')
              .setDescription('✅ **You were verified, but I couldn’t assign the role. Please contact a moderator.**')
              .setThumbnail('https://cdn-icons-png.flaticon.com/512/5610/5610944.png')
              .setFooter({
                text: '⚠️ Discord Verification System',
                iconURL: interaction.client.user.displayAvatarURL()
              })
              .setTimestamp()
          ],
          flags: MessageFlags.Ephemeral
        });
      }
    }

    log.error(`[auth] Wrong code entered by ${interaction.user.tag}`);
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('#ef4444')
          .setTitle('❌ Incorrect Code')
          .setDescription('❗ **The verification code you entered is incorrect!**\nPlease double-check your email.')
          .setThumbnail('https://cdn-icons-png.flaticon.com/512/5610/5610944.png')
          .setFooter({
            text: '❌ Discord Verification System',
            iconURL: interaction.client.user.displayAvatarURL()
          })
          .setTimestamp()
      ],
      flags: MessageFlags.Ephemeral
    });
  }
};

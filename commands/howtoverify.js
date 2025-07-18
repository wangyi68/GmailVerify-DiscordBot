
import { log } from '../utils/logger.js';
import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
  MessageFlags
} from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('howtoverify')
    .setDescription('📋 Step-by-step guide to verify your account via Gmail')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('📤 Send the guide to a specific channel')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    ),

  async execute(interaction) {
    
    const isOwner = interaction.user.id === process.env.BOT_OWNER_ID;
    const targetChannel = interaction.options.getChannel('channel');

    if (targetChannel && !isOwner) {
      return interaction.reply({
        content: '❌ Only the bot owner can use the channel option.',
        flags: MessageFlags.Ephemeral
      });
    }

    const embed = new EmbedBuilder()
      .setColor('#38bdf8')
      .setAuthor({
        name: 'GmailVerify Bot • Step-by-step Guide',
        iconURL: interaction.client.user.displayAvatarURL()
      })
      .setTitle('✅ How to Verify Your Account')
      .setDescription('Follow these 4 simple steps to complete your verification:')
      .addFields(
        { name: '🔗 Step 1: Link Gmail', value: '`/link`\nConnect your Gmail to Discord.', inline: false },
        { name: '✉️ Step 2: Send Verification Code', value: '`/verify`\nSend a 6-digit code to your Gmail.', inline: false },
        { name: '🔑 Step 3: Enter the Code', value: '`/auth <code>`\nSubmit the code you received in your inbox.', inline: false },
        { name: '� Step 4: Resend Code', value: '`/resend`\nDidn’t get the code? Use this to resend.', inline: false }
      )
      .setThumbnail('https://cdn-icons-png.flaticon.com/512/732/732200.png')
      .setFooter({
        text: '💡 Tip: Check your Spam folder if the email doesn’t appear.',
        iconURL: interaction.client.user.displayAvatarURL()
      })
      .setTimestamp();

    if (targetChannel) {
      await targetChannel.send({ embeds: [embed] });
      await interaction.reply({
        content: `✅ Guide successfully sent to ${targetChannel}.`,
        flags: MessageFlags.Ephemeral
      });
    } else {
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral
      });
    }
  }
};

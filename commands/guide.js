import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  MessageFlags
} from 'discord.js';
import fs from 'fs';
import path from 'path';

// Convert language code to regional flag emoji
function getFlagEmoji(countryCode) {
  return countryCode
    .toUpperCase()
    .replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt()));
}

// Read all JSON files in /locales and return available language options
function getAvailableLocales() {
  const localesDir = path.join(process.cwd(), 'locales');
  return fs.readdirSync(localesDir)
    .filter(file => file.endsWith('.json'))
    .map(file => {
      const code = path.basename(file, '.json');
      const data = JSON.parse(fs.readFileSync(path.join(localesDir, file), 'utf8'));
      const flag = getFlagEmoji(code);
      return { code, label: `${flag} ${data.languageName || code}` };
    });
}

// Load locale JSON by code
function loadLocale(lang) {
  const filePath = path.join(process.cwd(), 'locales', `${lang}.json`);
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`❌ Failed to load locale "${lang}":`, err.message);
    return null;
  }
}

// Create an embed guide from a locale
function createGuideEmbed(lang = 'en') {
  const locale = loadLocale(lang) || loadLocale('en');

  const embed = new EmbedBuilder()
    .setColor('#00b0f4')
    .setTitle('📘 ' + locale.title)
    .setDescription('📖 **' + locale.description + '**')
    .setThumbnail('https://cdn-icons-png.flaticon.com/512/5968/5968756.png')
    .setFooter({
      text: '📘 ' + locale.footer,
      iconURL: 'https://cdn-icons-png.flaticon.com/512/5968/5968756.png'
    })
    .setTimestamp();

  for (const cmd in locale.commands) {
    embed.addFields({
      name: `🔹 **/${cmd}**`,
      value: locale.commands[cmd],
      inline: false
    });
  }

  return embed;
}


import { log } from '../utils/logger.js';
// Build slash command with dynamic choices
const availableLocales = getAvailableLocales();
const commandBuilder = new SlashCommandBuilder()
  .setName('guide')
  .setDescription('📘 Full usage guide and advanced help (multi-language)')
  .addStringOption(option => {
    option.setName('lang').setDescription('🌐 Select guide language').setRequired(false);
    for (const locale of availableLocales) {
      option.addChoices({ name: locale.label, value: locale.code });
    }
    return option;
  });

export default {
  data: commandBuilder,

  async execute(interaction) {
   
    const lang = interaction.options.getString('lang') || 'en';

    // Create language buttons
    const buttons = availableLocales.map(locale =>
      new ButtonBuilder()
        .setCustomId(`lang_${locale.code}`)
        .setLabel(locale.label)
        .setStyle(locale.code === lang ? ButtonStyle.Primary : ButtonStyle.Secondary)
    );

    // Discord limits 5 buttons per row
    const rows = [];
    for (let i = 0; i < buttons.length; i += 5) {
      rows.push(new ActionRowBuilder().addComponents(buttons.slice(i, i + 5)));
    }

    const message = await interaction.reply({
      embeds: [
        createGuideEmbed(lang)
          .setAuthor({
            name: 'GmailVerify Bot Guide',
            iconURL: interaction.client.user.displayAvatarURL()
          })
      ],
      components: rows,
      flags: MessageFlags.Ephemeral
    });

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 5 * 60_000
    });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: '❌ This button is not for you.', flags: MessageFlags.Ephemeral });
      }

      const selectedLang = i.customId.replace('lang_', '');

      // Update buttons with selected language
      const updatedButtons = availableLocales.map(locale =>
        new ButtonBuilder()
          .setCustomId(`lang_${locale.code}`)
          .setLabel(locale.label)
          .setStyle(locale.code === selectedLang ? ButtonStyle.Primary : ButtonStyle.Secondary)
      );

      const updatedRows = [];
      for (let i = 0; i < updatedButtons.length; i += 5) {
        updatedRows.push(new ActionRowBuilder().addComponents(updatedButtons.slice(i, i + 5)));
      }

      await i.update({
        embeds: [createGuideEmbed(selectedLang)],
        components: updatedRows
      });
    });
  }
};

// utils/logger.js
import chalk from 'chalk';
import dayjs from 'dayjs'; // install if not already: npm install dayjs

// Format current timestamp
function timestamp() {
  return chalk.gray(`[${dayjs().format('HH:mm:ss - DD/MM/YYYY')}]`);
}

export const log = {
  command: (name, user) => {
    console.log(`${timestamp()} ${chalk.yellow(`💬 Command /${name}`)} used by ${chalk.cyan(user.tag)} (${user.id})`);
  },
  success: (msg) => {
    console.log(`${timestamp()} ${chalk.green(`✅ ${msg}`)}`);
  },
  error: (msg) => {
    console.log(`${timestamp()} ${chalk.red(`❌ ${msg}`)}`);
  },
  info: (msg) => {
    console.log(`${timestamp()} ${chalk.blue(`ℹ️  ${msg}`)}`);
  },
};
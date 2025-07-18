import { startBot } from './bot/index.js';
import { startServer } from './server/index.js';

await startServer();
await startBot();

import fs from 'fs/promises';
import { logLine } from '../helpers/colors.js';

async function ensureDir(dirPath) {
    logLine('ensureDir readying', dirPath);
    await fs.mkdir(dirPath, { recursive: true });
    logLine('ensureDir ready', dirPath);
}

export { ensureDir };
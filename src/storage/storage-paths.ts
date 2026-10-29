import { existsSync } from 'node:fs';
import * as path from 'node:path';

// Shared by uploads, static serving, and CLI, in both src and compiled dist.
const candidates = [
  path.resolve(__dirname, '../..'),
  path.resolve(__dirname, '../../..'),
  process.cwd(),
];

export const PROJECT_ROOT =
  candidates.find((directory) =>
    existsSync(path.join(directory, 'package.json')),
  ) ?? process.cwd();

export const STORAGE_DIRECTORY = path.join(PROJECT_ROOT, 'storage');
export const WATERMARK_LOGO_PATH = path.join(PROJECT_ROOT, 'public', 'logo.png');

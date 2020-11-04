import dotenv from 'dotenv';
import path from 'path';

const envPath =
  process.env.OPTIC_DEBUG_ENV_FILE || path.join(__dirname, '..', '.env');

dotenv.config({
  path: envPath,
});

export { run } from '@oclif/command';

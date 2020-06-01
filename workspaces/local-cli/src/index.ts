import dotenv from 'dotenv';
import path from 'path';

if (process.env.OPTIC_DEBUG_ENV_FILE) {
  dotenv.config({
    path: process.env.OPTIC_DEBUG_ENV_FILE,
  });
}

export { run } from '@oclif/command';

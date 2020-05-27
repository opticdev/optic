import dotenv from 'dotenv';
import path from 'path';
dotenv.config({
  path: path.join(__dirname, '../.env'),
});

export { run } from '@oclif/command';

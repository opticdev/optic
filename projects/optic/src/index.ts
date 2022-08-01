#!/usr/bin/env node
import dotenv from 'dotenv';
import path from 'path';
import { initCli } from './init';

dotenv.config({
  path: path.join(__dirname, '..', '.env'),
});

(async () => {
  const cli = await initCli();

  cli.parse(process.argv);
})();

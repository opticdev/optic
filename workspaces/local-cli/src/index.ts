import dotenv = require('dotenv');
import Path = require('path');
dotenv.config({
  path: Path.join(__dirname, '../.env'),
});

export { run } from '@oclif/command';

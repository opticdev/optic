export * from './optic-types';
import * as path from 'path';

export const basePath = __dirname;
export const InteractionBatch = require(path.join(
  basePath,
  'avro-schemas',
  'interaction-batch.json'
));

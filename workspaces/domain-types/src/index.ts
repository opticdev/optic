export * from './optic-types';
import path from 'path';

export const basePath = __dirname;
export const InteractionBatch = require(path.join(
  basePath,
  'avro-schemas',
  'interaction-batch.json'
));

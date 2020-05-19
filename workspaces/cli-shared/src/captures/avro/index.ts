import * as avro from 'avsc';
import * as path from 'path';
import { basePath } from '@useoptic/domain-types';

export const schema = require(path.join(basePath, 'avro-schemas/capture.json'));
export const serdes = avro.Type.forSchema(schema);

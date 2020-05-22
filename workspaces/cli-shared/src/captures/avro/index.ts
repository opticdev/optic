import * as avro from 'avsc';
import { InteractionBatch } from '@useoptic/domain-types';

export const schema = InteractionBatch;
export const serdes = avro.Type.forSchema(schema);

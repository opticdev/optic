import { IDiff, IDiffService } from './types';
import { ApiTraffic } from '../traffic/types';
import { opticJsonSchemaDiffer } from './differs/json-schema-json-diff';
import { JsonSchemaJsonDiffer } from './differs/json-schema-json-diff/types';

export class NeverReturnDiffService implements IDiffService {
  async compare(
    traffic: ApiTraffic
  ): Promise<{ diffs: IDiff[]; errors: string[] }> {
    return { diffs: [], errors: [] };
  }

  jsonSchemaDiffer: JsonSchemaJsonDiffer = opticJsonSchemaDiffer();
}

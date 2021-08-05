import { JsonType } from '@useoptic/optic-domain';
import { ChangeType } from '<src>/types';

export type ShapeId = string;

export type ReduxField = {
  fieldId: string;
  name: string;
  shapeId: string;
  changes: ChangeType | null;
  contributions: Record<string, string>;
};

export type ReduxShape =
  | {
      shapeId: string;
      jsonType: JsonType.OBJECT;
      asArray?: undefined;
      asObject: {
        fields: ReduxField[];
      };
    }
  | {
      shapeId: string;
      jsonType: JsonType.ARRAY;
      asArray: {
        shapeId: string;
      };
      asObject?: undefined;
    }
  | {
      shapeId: string;
      jsonType: Exclude<JsonType, JsonType.OBJECT | JsonType.ARRAY>;
      asArray?: undefined;
      asObject?: undefined;
    };

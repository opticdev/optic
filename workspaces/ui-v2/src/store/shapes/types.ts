import { JsonLike } from '@useoptic/optic-domain';
import { ChangeType } from '<src>/types';

export type ShapeId = string;

export type ReduxShape =
  | {
      shapeId: string;
      jsonType: JsonLike.OBJECT;
      asArray?: undefined;
      asObject: {
        fields: {
          fieldId: string;
          name: string;
          shapeId: string;
          changes: ChangeType | null;
          contributions: Record<string, string>;
        }[];
      };
    }
  | {
      shapeId: string;
      jsonType: JsonLike.ARRAY;
      asArray: {
        shapeId: string;
      };
      asObject?: undefined;
    }
  | {
      shapeId: string;
      jsonType: Exclude<JsonLike, JsonLike.OBJECT | JsonLike.ARRAY>;
      asArray?: undefined;
      asObject?: undefined;
    };

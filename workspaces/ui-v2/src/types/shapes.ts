import { ChangeType } from './changes';

export interface IFieldRenderer {
  fieldId: string;
  name: string;
  shapeId: string;
  shapeChoices: IShapeRenderer[];
  required: boolean;
  changes: ChangeType | null;
  contributions: Record<string, string>;
  // TODO - move this into a different typing or figure out where this should live
  additionalAttributes?: string[];
}

export type IShapeRenderer =
  | {
      shapeId: string;
      jsonType: JsonLike.OBJECT;
      asArray?: undefined;
      asObject: {
        fields: IFieldRenderer[];
      };
    }
  | {
      shapeId: string;
      jsonType: JsonLike.ARRAY;
      asArray: IArrayRender;
      asObject?: undefined;
    }
  | {
      shapeId: string;
      jsonType: Exclude<JsonLike, JsonLike.OBJECT | JsonLike.ARRAY>;
      asArray?: undefined;
      asObject?: undefined;
    };

export interface IArrayRender {
  shapeChoices: IShapeRenderer[];
  shapeId: string;
}

// TODO remove this
export interface IObjectRender {
  fields: IFieldRenderer[];
}

export enum JsonLike {
  OBJECT = 'Object',
  ARRAY = 'Array',
  NULL = 'Null',
  STRING = 'String',
  NUMBER = 'Number',
  BOOLEAN = 'Boolean',
  UNDEFINED = 'Undefined',
}

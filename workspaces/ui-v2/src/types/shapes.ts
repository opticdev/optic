import { ChangeType } from './changes';

export interface IFieldRenderer {
  fieldId: string;
  name: string;
  parentId: string;
  shapeId: string;
  shapeChoices: IShapeRenderer[];
  required: boolean;
  changes: ChangeType | null;
  contributions: Record<string, string>;
  // TODO - move this into a different typing or figure out where this should live
  additionalAttributes?: string[];
}

export interface IShapeRenderer {
  shapeId: string;
  jsonType: JsonLike;
  asArray?: IArrayRender;
  asObject?: IObjectRender;
}

export interface IArrayRender {
  shapeChoices: IShapeRenderer[];
  shapeId: string;
}

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

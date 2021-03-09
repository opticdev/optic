export interface IFieldRenderer {
  fieldId: string;
  fieldKey: string;
  shapeRenderers: IShapeRenderer[];
  required: boolean;
  description?: string;
  changelog?: IChangeLog;
}

export interface IShapeRenderer {
  shapeId: string;
  jsonType: JsonLike;
  asArray?: IArrayRender;
  asObject?: IObjectRender;
  value: any;
  changelog?: IChangeLog;
}

export interface IArrayRender {
  listItem: IShapeRenderer[];
}

export interface IObjectRender {
  fields: IFieldRenderer[];
}

export enum JsonLike {
  OBJECT = 'OBJECT',
  ARRAY = 'ARRAY',
  NULL = 'NULL',
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
}

/// Changelog Types
export interface IChangeLog {
  added?: boolean;
  removed?: boolean;
  changed?: {
    previousType: JsonLike;
  };
}

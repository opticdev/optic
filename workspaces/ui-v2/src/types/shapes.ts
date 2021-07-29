import { JsonLike } from '@useoptic/optic-domain';
import { ChangeType } from './changes';
import { IContribution } from './contributions';

// Types for rendering shapes and fields
export interface IFieldRenderer {
  fieldId: string;
  name: string;
  shapeId: string;
  shapeChoices: IShapeRenderer[];
  required: boolean;
  changes: ChangeType | null;
  contributions: Record<string, string>;
  additionalAttributes?: string[];
}

// Used to render an objects field details and contributions
export interface IFieldDetails {
  name: string;
  contribution: IContribution;
  shapes: IShapeRenderer[];
  depth: number;
}

// Used to render query parameters
export type QueryParameters = Record<string, IFieldRenderer>;

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

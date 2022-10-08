import { AttributeAssertions } from '../attribute/assertions';
import {
  FactVariant,
  OpenApiKind,
  OpenAPIV3,
} from '@useoptic/openapi-utilities';
import { Matcher, matches } from '../runner/matcher';
import { ResponseContext } from './response';
import { EntityBase } from './base';
import { Markdown, MarkdownSequence, renderAttributes } from '../markdown/util';
import { OperationContext } from './operation';
import { ParameterStandardRunner } from './parameter';

export type SchemaContext = {
  lifecycle: 'added' | 'removed' | 'continuous';
  parentLifecycle: 'added' | 'removed' | 'continuous';
  schema: OpenAPIV3.SchemaObject | {};
  parent: OpenAPIV3.SchemaObject | {};
  in: 'request' | 'response' | 'parameter';
  operation: {
    pathPattern: string;
    operationLifecycle: 'added' | 'removed' | 'continuous';
    method: OpenAPIV3.HttpMethods;
  };
};

export interface SchemaStandard {
  type?: string | AttributeAssertions<OpenAPIV3.SchemaObject, SchemaContext>;
  properties?: AttributeAssertions<
    OpenAPIV3.SchemaObject['properties'],
    SchemaContext
  >;

  required?: AttributeAssertions<
    OpenAPIV3.SchemaObject['required'],
    SchemaContext
  >;
  enum?: AttributeAssertions<OpenAPIV3.SchemaObject['enum'], SchemaContext>;
  example?: AttributeAssertions<
    OpenAPIV3.SchemaObject['example'],
    SchemaContext
  >;
  title?: AttributeAssertions<string | undefined, SchemaContext>;
  description?: AttributeAssertions<string | undefined, SchemaContext>;
  pattern?: AttributeAssertions<string | undefined, SchemaContext>;
  format?: AttributeAssertions<string | undefined, SchemaContext>;
  nullable?: AttributeAssertions<boolean | undefined, SchemaContext>;
  minimum?: AttributeAssertions<number | undefined, SchemaContext>;
  maximum?: AttributeAssertions<number | undefined, SchemaContext>;
  maxItems?: AttributeAssertions<number | undefined, SchemaContext>;
  minItems?: AttributeAssertions<number | undefined, SchemaContext>;

  propertyRequired?: AttributeAssertions<boolean | undefined, SchemaContext>;
  propertyKey?: AttributeAssertions<string | undefined, SchemaContext>;

  [x: `x-${string}`]: AttributeAssertions<unknown | undefined, SchemaContext>;
}

export const SchemaV3 = (standard: SchemaStandard) =>
  new SchemaStandardRunner<OpenAPIV3.SchemaObject>(standard);

export class SchemaStandardRunner<OpenAPIType> extends EntityBase<
  OpenAPIV3.SchemaObject,
  SchemaContext,
  OpenApiKind.Field
> {
  override kind: OpenApiKind = OpenApiKind.Field;

  constructor(private standard: SchemaStandard) {
    super();
    if (this.standard.type) {
      this.applyWhen(`${this.standard.type} schemas`, (param) => {
        return param.type === this.standard.type;
      });
    } else {
      this.applyWhen(`all schema`, () => true);
    }
  }

  override toMarkdown(): MarkdownSequence {
    return [
      Markdown.h3(`${this.applyWhenPredicate.matchesName}`),
      this.standardExplained ? `\n${this.standardExplained}\n` : '',
      ...renderAttributes(this.standard as any),
    ];
  }
}

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

export type ParameterContext = {
  lifecycle: 'added' | 'removed' | 'continuous';
  in: UnionParameterKinds;
  operation: {
    pathPattern: string;
    operationLifecycle: 'added' | 'removed' | 'continuous';
    method: OpenAPIV3.HttpMethods;
  };
};

type UnionParameterKinds = 'query' | 'path' | 'cookie' | 'header';

export interface ParameterStandard {
  name?: string | AttributeAssertions<string | undefined, ParameterContext>;
  in?: UnionParameterKinds;
  required?: AttributeAssertions<boolean | undefined, ParameterContext>;
  style?: AttributeAssertions<
    OpenAPIV3.ParameterObject['style'] | undefined,
    ParameterContext
  >;
  schema?: AttributeAssertions<
    OpenAPIV3.SchemaObject | undefined,
    ResponseContext
  >;
  explode?: AttributeAssertions<
    OpenAPIV3.ParameterObject['explode'] | undefined,
    ParameterContext
  >;
  example?: AttributeAssertions<
    OpenAPIV3.ParameterObject['example'] | undefined,
    ParameterContext
  >;
  examples?: AttributeAssertions<
    OpenAPIV3.ParameterObject['examples'] | undefined,
    ParameterContext
  >;
}

export const ParameterV3 = (standard: ParameterStandard) =>
  new ParameterStandardRunner<OpenAPIV3.ParameterObject>(standard);

export class ParameterStandardRunner<OpenAPIType> extends EntityBase<
  OpenAPIV3.ParameterObject,
  ParameterContext,
  | OpenApiKind.PathParameter
  | OpenApiKind.CookieParameter
  | OpenApiKind.HeaderParameter
  | OpenApiKind.QueryParameter
> {
  override kind: OpenApiKind = OpenApiKind.PathParameter;

  constructor(private standard: ParameterStandard) {
    super();

    if (this.standard.in && this.standard.name) {
      this.applyWhen(
        `${this.standard.in} parameter named \`${this.standard.name}\``,
        (param) => {
          return (
            param.name === this.standard.name && param.in === this.standard.in
          );
        }
      );
    } else if (this.standard.in) {
      this.applyWhen(`${this.standard.in} parameters`, (param) => {
        return param.in === this.standard.in;
      });
    }
  }

  override toMarkdown(): MarkdownSequence {
    const { in: __, name, ...other } = this.standard;

    return [
      Markdown.p(this.applyWhenPredicate.matchesName),
      this.standardExplained ? `\n${this.standardExplained}\n` : '',
      Markdown.bullets(...renderAttributes(other as any)),
    ];
  }
}

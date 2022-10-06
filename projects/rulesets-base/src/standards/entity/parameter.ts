import { AttributeAssertions } from '../attribute/assertions';
import {
  FactVariant,
  OpenApiKind,
  OpenAPIV3,
} from '@useoptic/openapi-utilities';
import { Matcher } from '../runner/matcher';
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

export function Parameter<OpenAPIType>(
  parameter:
    | ParameterStandard
    | {
        filter: Matcher<OpenAPIType, ParameterContext>;
        standard: ParameterStandard;
      }
) {
  const standard = 'filter' in parameter ? parameter.standard : parameter;
  const matcher =
    'filter' in parameter
      ? parameter.filter
      : { matchesName: 'Applies to All Operations', predicate: () => true };

  return new ParameterStandardRunner(standard, matcher);
}

export class ParameterStandardRunner<OpenAPIType> extends EntityBase<
  OpenAPIType,
  ParameterContext,
  | FactVariant<OpenApiKind.PathParameter>
  | FactVariant<OpenApiKind.CookieParameter>
  | FactVariant<OpenApiKind.HeaderParameter>
  | FactVariant<OpenApiKind.QueryParameter>
> {
  private matchName: string;

  constructor(
    private standard: ParameterStandard,
    private matches: Matcher<OpenAPIType, ParameterContext>
  ) {
    super();

    this.matchName = (() => {
      if (standard.name) {
        return `\`${standard.name}\` ${
          standard.in ? `in ${standard.in}` : ''
        }  `;
      }
      if (standard.in) {
        return `all \`${standard.in}\` parameters`;
      }
      return matches.matchesName;
    })();
  }

  override toMarkdown(): MarkdownSequence {
    const { in: __, name, ...other } = this.standard;

    return [
      Markdown.p(this.matchName),
      Markdown.bullets(...renderAttributes(other as any)),
    ];
  }
}

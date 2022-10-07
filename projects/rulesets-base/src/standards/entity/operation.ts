import { AttributeAssertions } from '../attribute/assertions';
import {
  FactVariant,
  OpenApiKind,
  OpenAPIV3,
} from '@useoptic/openapi-utilities';
import { Matcher } from '../runner/matcher';
import { ParameterStandard, ParameterStandardRunner } from './parameter';
import { ResponseStandardRunner } from './response';
import { EntityBase, RunnerEntityInputs } from './base';
import { Markdown, MarkdownSequence, renderAttributes } from '../markdown/util';
import { runner } from '../runner/runner';

export type OperationContext = {
  pathPattern: string;
  lifecycle: 'added' | 'removed' | 'continuous';
  method: OpenAPIV3.HttpMethods;
};

export interface OperationStandard {
  summary?: AttributeAssertions<string | undefined, OperationContext>;
  operationId?: AttributeAssertions<string | undefined, OperationContext>;
  tags?: AttributeAssertions<
    OpenAPIV3.OperationObject['tags'] | undefined,
    OperationContext
  >;
  parameters?: (ParameterStandard | ParameterStandardRunner<any>)[];
  responses?: ResponseStandardRunner<any>[];
  // extension attributes could be supported this way
  [x: `x-${string}`]: AttributeAssertions<
    unknown | undefined,
    OperationContext
  >;
}

export function Operation<OpenAPIType>(
  operation:
    | OperationStandard
    | {
        filter: Matcher<OpenAPIType, OperationContext>;
        standard: OperationStandard;
      }
) {
  const standard = 'filter' in operation ? operation.standard : operation;
  const matcher =
    'filter' in operation
      ? operation.filter
      : {
          matchesName: 'Applies to All Operations',
          predicate: (_, context) =>
            context.lifecycle === 'added' || context.lifecycle === 'continuous',
        };

  return new OperationStandardRunner(standard, matcher);
}

export class OperationStandardRunner<OpenAPIType> extends EntityBase<
  OpenAPIType,
  OperationContext,
  OpenApiKind.Operation
> {
  constructor(
    private standard: OperationStandard,
    private matches: Matcher<OpenAPIType, OperationContext>
  ) {
    super();
  }

  override createContext(
    fact: FactVariant<OpenApiKind.Operation>,
    lifecycle: 'added' | 'removed' | 'continuous',
    inputs: RunnerEntityInputs
  ): OperationContext {
    return {
      lifecycle,
      pathPattern: fact.value.pathPattern,
      method: fact.value.method as OpenAPIV3.HttpMethods,
    };
  }
  override run(input: RunnerEntityInputs) {
    runner<OpenAPIType, OperationContext>(
      input,
      OpenApiKind.Operation,
      this,
      this.matches
    );
  }

  toMarkdown(): MarkdownSequence {
    const { parameters, responses, ...other } = this.standard;

    // const parametersAsClasses = this.collectParametersAsClasses();

    return [
      Markdown.h1(`Operation Standard: ${this.matches.matchesName}`),
      ...renderAttributes(other as any),
      // ...(parameters?.length
      //   ? [
      //       '\n',
      //       Markdown.h2('Parameters'),
      //       ...parametersAsClasses.map((i) => i.toMarkdown().join('\n')),
      //     ]
      //   : []),
      ...(responses?.length
        ? [
            '\n',
            Markdown.h2('Responses'),
            ...responses.map((i) => i.toMarkdown().join('')),
          ]
        : []),
    ];
  }
}

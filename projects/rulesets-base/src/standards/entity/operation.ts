import { AttributeAssertions } from '../attribute/assertions';
import { OpenApiKind, OpenAPIV3 } from '@useoptic/openapi-utilities';
import { matches } from '../runner/matcher';
import { ParameterStandardRunner } from './parameter';
import { ResponseStandardRunner } from './response';
import { EntityBase } from './base';
import { Markdown, MarkdownSequence, renderAttributes } from '../markdown/util';
import { RequestStandardRunner } from './request';

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
  requestBody?: RequestStandardRunner<OpenAPIV3.RequestBodyObject>;
  parameters?: ParameterStandardRunner<OpenAPIV3.ParameterObject>[];
  responses?: ResponseStandardRunner<OpenAPIV3.ResponseObject>[];
  // extension attributes could be supported this way
  [x: `x-${string}`]: AttributeAssertions<
    unknown | undefined,
    OperationContext
  >;
}

export const OperationV3 = (operation: OperationStandard) =>
  new OperationStandardRunner<OpenAPIV3.OperationObject>(operation);

export class OperationStandardRunner<OpenAPIType> extends EntityBase<
  OpenAPIType,
  OperationContext,
  OpenApiKind.Operation
> {
  constructor(private standard: OperationStandard) {
    super();
  }

  override kind: OpenApiKind = OpenApiKind.Operation;

  override applyWhenPredicate = matches('All Operations', () => true);

  toMarkdown(): MarkdownSequence {
    const { parameters, requestBody, responses, ...other } = this.standard;

    return [
      Markdown.h1(`Operation Standard: ${this.applyWhenPredicate.matchesName}`),
      this.standardExplained ? `\n${this.standardExplained}\n` : '',
      ...renderAttributes(other as any),
      ...(parameters?.length
        ? [
            '\n',
            Markdown.h2('Parameters'),
            ...parameters.map((i) => i.toMarkdown().join('\n')),
          ]
        : []),
      ...(requestBody
        ? [
            '\n',
            Markdown.h2('Request Body'),
            '\n',
            requestBody.toMarkdown().join(''),
            '\n',
          ]
        : []),
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

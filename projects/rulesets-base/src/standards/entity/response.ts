import { AttributeAssertions } from '../attribute/assertions';
import {
  FactVariant,
  OpenApiKind,
  OpenAPIV3,
} from '@useoptic/openapi-utilities';
import { EntityBase } from './base';
import { Markdown, MarkdownSequence, renderAttributes } from '../markdown/util';

export type ResponseContext = {
  lifecycle: 'added' | 'removed' | 'continuous';
  statusCode: string;
  operation: {
    pathPattern: string;
    operationLifecycle: 'added' | 'removed' | 'continuous';
    method: OpenAPIV3.HttpMethods;
  };
};

export interface ResponseStandard {
  description?: AttributeAssertions<string | undefined, ResponseContext>;
  content?: {
    [contentType: `${string}/${string}`]: {
      schema?: AttributeAssertions<
        OpenAPIV3.SchemaObject | undefined,
        ResponseContext
      >;
      example?: AttributeAssertions<
        OpenAPIV3.MediaTypeObject['example'] | undefined,
        ResponseContext
      >;
      examples?: AttributeAssertions<
        OpenAPIV3.MediaTypeObject['examples'] | undefined,
        ResponseContext
      >;
    };
  };
  // headers: []
}

export const ResponseV3 = (
  statusCodeMatcher: string,
  standard: ResponseStandard
) => {
  const responseRunner = new ResponseStandardRunner<OpenAPIV3.ResponseObject>(
    standard
  );
  responseRunner.applyWhen(`${statusCodeMatcher} responses`, (_, context) => {
    return statusCodeMatcher === context.statusCode;
  });
  return responseRunner;
};

export class ResponseStandardRunner<OpenAPIType> extends EntityBase<
  OpenAPIV3.ResponseObject,
  ResponseContext,
  OpenApiKind.Response
> {
  constructor(private standard: ResponseStandard) {
    super();
  }

  override kind: OpenApiKind = OpenApiKind.Response;

  override toMarkdown(): MarkdownSequence {
    const { content, ...other } = this.standard;

    const contentTypes = Object.keys(content || {});

    return [
      '\n',
      Markdown.h3(`${this.applyWhenPredicate.matchesName}`),
      this.standardExplained ? `\n${this.standardExplained}\n` : '',
      ...renderAttributes(other as any),
      '\n',
      ...contentTypes.map((contentType) => {
        const { schema } = content?.[contentType];
        return [
          '\n',
          Markdown.bold(`content-type: ${contentType}`),
          '\n\n',
          schema ? renderAttributes({ schema }) : '\n',
        ].join('');
      }),
    ];
  }
}

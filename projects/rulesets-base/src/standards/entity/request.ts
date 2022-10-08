import { AttributeAssertions } from '../attribute/assertions';
import { OpenApiKind, OpenAPIV3 } from '@useoptic/openapi-utilities';
import { Matcher } from '../runner/matcher';
import { stat } from 'fs';
import { EntityBase } from './base';
import { Markdown, MarkdownSequence, renderAttributes } from '../markdown/util';

export type RequestContext = {
  lifecycle: 'added' | 'removed' | 'continuous';
  operation: {
    pathPattern: string;
    operationLifecycle: 'added' | 'removed' | 'continuous';
    method: OpenAPIV3.HttpMethods;
  };
};

export interface RequestStandard {
  description?: AttributeAssertions<string | undefined, RequestContext>;
  required?: AttributeAssertions<boolean, RequestContext>;
  content?: {
    [contentType: `${string}/${string}`]: {
      schema?: AttributeAssertions<
        OpenAPIV3.SchemaObject | undefined,
        RequestContext
      >;
      example?: AttributeAssertions<
        OpenAPIV3.MediaTypeObject['example'] | undefined,
        RequestContext
      >;
      examples?: AttributeAssertions<
        OpenAPIV3.MediaTypeObject['examples'] | undefined,
        RequestContext
      >;
    };
  };
}

export const RequestV3 = (request: RequestStandard) =>
  new RequestStandardRunner<OpenAPIV3.RequestBodyObject>(request);

export class RequestStandardRunner<OpenAPIType> extends EntityBase<
  OpenAPIV3.RequestBodyObject,
  RequestContext,
  OpenApiKind.Request
> {
  constructor(private standard: RequestStandard) {
    super();
  }
  override kind: OpenApiKind = OpenApiKind.Request;

  override toMarkdown(): MarkdownSequence {
    const { content, ...other } = this.standard;

    const contentTypes = Object.keys(content || {});

    return [
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

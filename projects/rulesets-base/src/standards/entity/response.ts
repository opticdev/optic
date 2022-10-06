import { AttributeAssertions } from '../attribute/assertions';
import {
  FactVariant,
  OpenApiKind,
  OpenAPIV3,
} from '@useoptic/openapi-utilities';
import { Matcher } from '../runner/matcher';
import { stat } from 'fs';
import { EntityBase } from './base';
import {
  AttributeMustBlock,
  Markdown,
  MarkdownSequence,
  renderAttributes,
} from '../markdown/util';

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

export function Response<OpenAPIType>(
  statusCodeMatcher: string,
  response:
    | ResponseStandard
    | {
        filter: Matcher<OpenAPIType, ResponseContext>;
        standard: ResponseStandard;
      }
) {
  const standard = 'filter' in response ? response.standard : response;
  const matcher =
    'filter' in response
      ? response.filter
      : {
          matchesName: `\`${statusCodeMatcher}\` Response`,
          predicate: (x, context) => context.statusCode === statusCodeMatcher,
        };

  return new ResponseStandardRunner(statusCodeMatcher, standard, matcher);
}

export class ResponseStandardRunner<OpenAPIType> extends EntityBase<
  OpenAPIV3.ResponseObject,
  ResponseContext,
  FactVariant<OpenApiKind.Response>
> {
  constructor(
    private statusCodeMatcher: string,
    private standard: ResponseStandard,
    private matches: Matcher<OpenAPIType, ResponseContext>
  ) {
    super();
  }

  override toMarkdown(): MarkdownSequence {
    const { content, ...other } = this.standard;

    const contentTypes = Object.keys(content || {});

    return [
      '\n',
      Markdown.h3(`${this.matches.matchesName}`),
      ...renderAttributes(other as any),
      '\n',
      ...contentTypes.map((contentType) => {
        const { schema } = content?.[contentType];
        return [
          Markdown.bold(`content-type: ${contentType}`),
          '\n',
          schema ? renderAttributes({ schema }) : '\n',
        ].join('');
      }),
    ];
  }
}

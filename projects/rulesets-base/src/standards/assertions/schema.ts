import { OpenApiBodyFact, OpenAPIV3 } from '@useoptic/openapi-utilities';
import { ErrorMessageInput } from './error-message';
import { StringAssertion } from './string';
import { codeblock, indent } from '../markdown/util';

type FlatSchema = OpenApiBodyFact['flatSchema'];

export type SchemaAssertion<Context> =
  | ((schema: FlatSchema, context: Context) => void)
  | SchemaMatchingValidator;

type SchemaMatchingValidator = {
  standardName: string;
  matches: OpenAPIV3.SchemaObject;
  throwIfInvalid: (input: string) => void;
};

export function AssertSchema(
  standardName: string = 'schema matches',
  matches: OpenAPIV3.SchemaObject,
  errorMessage: ErrorMessageInput<string> = 'did not match schema assertions'
): SchemaMatchingValidator {
  return {
    standardName,
    matches,
    throwIfInvalid: (input: string) => {
      // use AJV
    },
  };
}

export function SchemaAssertionMarkdown(
  name: string,
  input: SchemaAssertion<any> | undefined
) {
  if (!input) return undefined;
  if ('standardName' in input) {
    return `\`${name}\` ${
      input.standardName
    }. The schema must extend: \n${indent(
      codeblock(JSON.stringify(input.matches, null, 2), 'json'),
      4
    )}`;
  } else if (`\`${name}\` passes function`) {
  }
}

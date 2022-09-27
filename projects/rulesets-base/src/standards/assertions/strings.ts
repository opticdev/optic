import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { ErrorMessageInput } from './error-message';

export type StringAssertion<Context> =
  | string
  | ((value: string, context: Context) => void)
  | StringAssertionValidator;

type StringAssertionValidator = {
  throwIfInvalid: (input: string) => void;
};

export function AssertString(
  standardName: string = 'must be set',
  jsonSchemaString: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    enum?: string[];
    type?: 'string';
  } = {},
  errorMessage: ErrorMessageInput<string> = 'did not match string assertions'
): StringAssertionValidator {
  return {
    throwIfInvalid: (input: string) => {
      // use AJV
    },
  };
}

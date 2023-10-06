import { OpenAI } from 'openai';
import { openai } from './openai';

export type OpenAPIRuleType =
  | 'OPERATION'
  | 'PROPERTY'
  | 'REQUEST'
  | 'RESPONSE'
  | 'RESPONSE_HEADER'
  | 'PATH_PARAMETER'
  | 'QUERY_PARAMETER'
  | 'HEADER_PARAMETER';

export type PreparedRule = {
  entity: OpenAPIRuleType;
  rule: string;
  changed: boolean;
  severity: 'ERROR' | 'WARNING';
};
export async function prepareRule(rule: string): Promise<
  | {
      entity: OpenAPIRuleType;
      rule: string;
      changed: boolean;
      severity: 'ERROR' | 'WARNING';
    }
  | undefined
> {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content:
          'You are an AI OpenAPI linter. The user is providing you with natural language rules. Your job is to classify the rules so we can provide you with the context you need to evaluate if the rule passes or fails. Please extract the part of OpenAPI (the entity) that each natural language rule refers to. We will provide you a snippet from the OpenAPI file that matches. Make sure you ask for the part of OpenAPI that gives you all the information you need to evaluate the rule. Example: "All query parameters MUST be Param-Case" = QUERY_PARAMETER.\n"Every GET response that returns an array should use pagination" = OPERATION\n"An operationId MUST never change" = OPERATION\n\nIf the rule the user provides has nothing to do with OpenAPI, call "skip()".',
      },
      {
        role: 'user',
        content: `"${rule}"`,
      },
    ],
    model: 'gpt-4-0613',
    temperature: 0,
    functions: [
      {
        name: 'skip',
        description:
          'Only call this function if the rule provided has nothing to do with OpenAPI.',
        parameters: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'attachRule',
        parameters: {
          type: 'object',
          required: ['openapiEntity', 'changed', 'severity'],
          properties: {
            changed: {
              description:
                'default to false. Does this rule check if something in the OpenAPI specification has changed? If so set to true and we will provide you the data from before and after',
              type: 'boolean',
            },
            severity: {
              description: 'Is this an error or a warning?',
              type: 'string',
              enum: ['ERROR', 'WARNING'],
            },
            openapiEntity: {
              type: 'string',
              description:
                'The part of an OpenAPI description that this rule is concerned with',
              enum: [
                'OPERATION',
                'PROPERTY',
                'REQUEST',
                'RESPONSE',
                'RESPONSE_HEADER',
                'PATH_PARAMETER',
                'QUERY_PARAMETER',
                'HEADER_PARAMETER',
              ],
            },
          },
        },
      },
    ],
  });

  const functionCall = completion.choices[0].message.function_call;
  if (functionCall && functionCall.name === 'attachRule') {
    const parsed = JSON.parse(functionCall.arguments);
    return {
      rule,
      changed: parsed.changed,
      severity: parsed.severity,
      entity: parsed.openapiEntity,
    };
  } else {
    return undefined;
  }
}

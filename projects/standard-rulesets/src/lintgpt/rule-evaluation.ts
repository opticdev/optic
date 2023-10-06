import { OpenAI } from 'openai';
import { openai } from './openai';
import { PreparedRule } from './prepare-rule';
import { writeYaml } from '@useoptic/openapi-io';

export type AIRuleEvaluationResult =
  | {
      passed: true;
    }
  | { passed: false; error: string }
  | { skipped: true };
export async function evaluateRule(
  preparedRule: PreparedRule,
  locationContext: string,
  value: any,
  before?: any
): Promise<AIRuleEvaluationResult> {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `You are an AI OpenAPI linter that checks if this OpenAPI ${
          preparedRule.entity
        } follows rules the user provides. Location: ${locationContext}.
${
  before
    ? `
Before:
\`\`\`yaml
${writeYaml(value)}
\`\`\`
`
    : ''
}
${before ? 'After' : ''}
\`\`\`yaml
${writeYaml(value)}
\`\`\`

Respond with the returnResult function {passed: true | false, error?: string, skipped: boolean}
If the example is not relevant to the rule ie rule cares about object properties, but provided example is a string property, skipped:true
`,
      },
      {
        role: 'user',
        content: `Does the ${preparedRule.entity} follow this rule?
"${preparedRule.rule}"`,
      },
    ],
    model: 'gpt-4-0613',
    temperature: 0,
    function_call: { name: 'returnResult' },
    functions: [
      {
        name: 'returnResult',
        description: 'The result of the rule',
        parameters: {
          type: 'object',
          required: ['passed', 'skipped'],
          properties: {
            passed: {
              type: 'boolean',
            },
            error: {
              type: 'string',
              description:
                'When passed is false, give the user an error explaining why the rule was failed and why it matters.',
            },
            skipped: {
              type: 'boolean',
              description:
                'The rule is not relevant to the example provided. Skip this result.',
            },
          },
        },
      },
    ],
  });

  // console.log(JSON.stringify(completion, null, 2));

  try {
    const functionCall = completion.choices[0].message.function_call!;

    const parsed = JSON.parse(functionCall.arguments);
    if (parsed.skipped) {
      return { skipped: true };
    }
    if (parsed.passed) {
      return {
        passed: true,
      };
    } else {
      return {
        passed: parsed.passed,
        error: parsed.error,
      };
    }
  } catch (e) {
    throw new Error('Error evaluating lintgpt rule ' + e);
  }
}

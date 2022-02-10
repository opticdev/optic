import { check } from '../define-check';
import { scenario } from '../scenarios';

export type ApiDictionaryConfig = {
  allowed: string[];
};

const abc = check<ApiDictionaryConfig>('allow only whitelisted property names')
  .implementation(({ bodyProperties }, config) => {
    const { expect } = require('chai');

    bodyProperties.added.must('be named from whitelist', (added, context) => {
      if (!config!.allowed.includes(added.key))
        expect.fail(`name ${added.key} is not allowed`);
    });
  })
  .passingExample(
    scenario('adding with names on whitelist').responseBodySchema.added({
      type: 'object',
      properties: {
        a: { type: 'string' },
        b: { type: 'string' },
        c: { type: 'string' },
      },
    }),
    {
      allowed: ['a', 'b', 'c'],
    }
  )
  .failingExample(
    scenario('adding with names not on whitelist').responseBodySchema.added({
      type: 'object',
      properties: {
        d: { type: 'string' },
        e: { type: 'string' },
        f: { type: 'string' },
      },
    }),
    {
      allowed: ['a', 'b', 'c'],
    }
  );

import { SnykApiCheckDsl } from '../dsl';
const { expect } = require('chai');

export const rules = {
  example: ({ checkApiContext, responses }: SnykApiCheckDsl) => {
    checkApiContext.must(
      'lifeycle rules have to be followed',
      (context, docs) => {
        docs.includeDocsLink('https://how.we.version/rule');
        context.changeVersion.date;
      },
    );
  },
};

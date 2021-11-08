import { SnykApiCheckDsl } from '../dsl';
const { expect } = require('chai');
export const rules = {
  propertyKey: ({ bodyProperties }: SnykApiCheckDsl) => {
    bodyProperties.requirement.must('have camel case keys', ({ key }) => {
      const camelCaseRe = /^[a-z]+([A-Z][a-z]+)+$/g;
      expect(camelCaseRe.test(key)).to.be.ok;
    });
  },
  propertyExample: ({ bodyProperties }: SnykApiCheckDsl) => {
    bodyProperties.requirement.must('have an example', ({ flatSchema }) => {
      expect(flatSchema.example).to.exist;
    });
  },
  propertyFormat: ({ bodyProperties }: SnykApiCheckDsl) => {
    bodyProperties.requirement.should(
      'have a format when a string',
      ({ flatSchema }) => {
        if (flatSchema.type === 'string') {
          expect(flatSchema.format).to.exist;
        }
      },
    );
  },
};

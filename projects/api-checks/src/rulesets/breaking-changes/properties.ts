import { expect } from 'chai';
import { ApiChangeDsl } from '../../sdk/api-change-dsl';

export const rules = {
  preventRemoval: ({ bodyProperties }: ApiChangeDsl) => {
    bodyProperties.removed.must('not be removed', (property) => {
      expect.fail(`expected ${property.key} to be present`);
    });
  },
  preventAddingRequiredRequestProperties: ({
    bodyProperties,
  }: ApiChangeDsl) => {
    bodyProperties.added.must('not be required', (property, context) => {
      if ('inRequest' in context) expect(property.required).to.not.be.true;
    });
  },
};

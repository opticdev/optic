import { SnykApiCheckDsl } from '../dsl';
const { expect } = require('chai');
export const rules = {
  propertyKey: ({ bodyProperties }: SnykApiCheckDsl) => {
    bodyProperties.requirement.must('have camel case keys', ({ key }) => {
      const snakeCase = /^[a-z]+(?:_[a-z]+)*$/g;
      expect(snakeCase.test(key)).to.be.ok;
    });
  },
  propertyFormat: ({ bodyProperties }: SnykApiCheckDsl) => {
    bodyProperties.requirement.should(
      'have a format when a string',
      ({ flatSchema }, context) => {
        if (flatSchema.type !== 'string') return;
        // @ts-ignore
        const jsonSchemaTrail = context.jsonSchemaTrail;
        if (jsonSchemaTrail.length < 3) return;
        if (
          !(
            jsonSchemaTrail[0] === 'data' && jsonSchemaTrail[1] === 'attributes'
          )
        )
          return;
        expect(flatSchema.format).to.exist;
      }
    );
  },
  preventRemoval: ({ bodyProperties }: SnykApiCheckDsl) => {
    bodyProperties.removed.must('not be removed', (property) => {
      expect(false, `expected ${property.key} to be present`).to.be.ok;
    });
  },
  preventAddingRequiredRequestProperties: ({
    bodyProperties,
  }: SnykApiCheckDsl) => {
    bodyProperties.added.must('not be required', (property, context) => {
      if (!('inRequest' in context)) return;
      expect(property.required).to.not.be.true;
    });
  },
  enumOrExample: ({ bodyProperties }: SnykApiCheckDsl) => {
    bodyProperties.requirement.must(
      'have enum or example',
      (property, context, docs, specItem) => {
        if (!('inResponse' in context)) return;
        // @ts-ignore
        const jsonSchemaTrail = context.jsonSchemaTrail;
        if (jsonSchemaTrail.length < 3) return;
        if (
          !(
            jsonSchemaTrail[0] === 'data' && jsonSchemaTrail[1] === 'attributes'
          )
        )
          return;
        if (specItem.type === 'object' || specItem.type === 'boolean') return;
        expect('enum' in specItem || 'example' in specItem).to.be.true;
      }
    );
  },
  dateFormatting: ({ bodyProperties, operations }: SnykApiCheckDsl) => {
    bodyProperties.requirement.must(
      'use date-time for dates',
      (property, context) => {
        if (!('inResponse' in context)) return;
        if (['created', 'updated', 'deleted'].includes(property.key)) {
          expect(property.flatSchema.format).to.equal('date-time');
        }
      }
    );
  },
  arrayWithItems: ({ bodyProperties, operations }: SnykApiCheckDsl) => {
    bodyProperties.requirement.must(
      'have type for array items',
      (property, context, docs, specItem) => {
        if (specItem.type === 'array') {
          expect(specItem.items).to.have.property('type');
        }
      }
    );
  },
};

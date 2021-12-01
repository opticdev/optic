import { SnykApiCheckDsl } from '../dsl';
import { expect } from 'chai';

// TODO: make sure this works for data.items.properties.attributes and data.properties.attributes
function withinAttributes(context) {
  // @ts-ignore
  const { jsonSchemaTrail } = context;
  // We don't want to check [data, attributes] so we return false for anything
  // that isn't nested deeper.
  if (jsonSchemaTrail.length < 3) return false;
  if (!(jsonSchemaTrail[0] === 'data' && jsonSchemaTrail[1] === 'attributes'))
    return false;
  return true;
}

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
        if (!withinAttributes(context)) return;
        expect(flatSchema.format).to.exist;
      }
    );
  },
  preventRemoval: ({ bodyProperties }: SnykApiCheckDsl) => {
    bodyProperties.removed.must('not be removed', (property) => {
      expect.fail(`expected ${property.key} to be present`);
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
        if (!withinAttributes(context)) return;
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

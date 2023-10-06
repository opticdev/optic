import { test, expect, describe } from '@jest/globals';
import { computeEffectiveTypeChange } from '../type-change';

describe('computeEffectiveTypeChange', () => {
  test('identical sets', () => {
    expect(computeEffectiveTypeChange('boolean', ['boolean'])).toEqual({
      expanded: false,
      narrowed: false,
      identical: true,
    });

    expect(computeEffectiveTypeChange('string', 'string')).toEqual({
      expanded: false,
      narrowed: false,
      identical: true,
    });

    expect(
      computeEffectiveTypeChange(['string', 'number'], ['number', 'string'])
    ).toEqual({
      expanded: false,
      narrowed: false,
      identical: true,
    });
  });

  test('non-identical sets', () => {
    expect(computeEffectiveTypeChange('boolean', ['string'])).toEqual({
      expanded: true,
      narrowed: true,
      identical: false,
    });

    expect(computeEffectiveTypeChange('string', 'number')).toEqual({
      expanded: true,
      narrowed: true,
      identical: false,
    });

    expect(
      computeEffectiveTypeChange(['string'], ['number', 'string'])
    ).toEqual({
      expanded: true,
      narrowed: false,
      identical: false,
    });

    expect(
      computeEffectiveTypeChange(['string', 'number'], ['string'])
    ).toEqual({
      expanded: false,
      narrowed: true,
      identical: false,
    });

    expect(
      computeEffectiveTypeChange(['string', 'number'], ['string', 'boolean'])
    ).toEqual({
      expanded: true,
      narrowed: true,
      identical: false,
    });
  });
});

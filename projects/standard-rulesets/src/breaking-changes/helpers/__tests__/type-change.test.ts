import { test, expect, describe } from '@jest/globals';
import { computeEffectiveTypeChange } from '../type-change';

describe('computeEffectiveTypeChange', () => {
  test('identical sets', () => {
    expect(computeEffectiveTypeChange('boolean', ['boolean'])).toEqual({
      expanded: false,
      narrowed: false,
    });

    expect(computeEffectiveTypeChange('string', 'string')).toEqual({
      expanded: false,
      narrowed: false,
    });

    expect(
      computeEffectiveTypeChange(['string', 'number'], ['number', 'string'])
    ).toEqual({
      expanded: false,
      narrowed: false,
    });
  });

  test('non-identical sets', () => {
    expect(computeEffectiveTypeChange('boolean', ['string'])).toEqual({
      expanded: true,
      narrowed: true,
    });

    expect(computeEffectiveTypeChange('string', 'number')).toEqual({
      expanded: true,
      narrowed: true,
    });

    expect(
      computeEffectiveTypeChange(['string'], ['number', 'string'])
    ).toEqual({
      expanded: true,
      narrowed: false,
    });

    expect(
      computeEffectiveTypeChange(['string', 'number'], ['string'])
    ).toEqual({
      expanded: false,
      narrowed: true,
    });

    expect(
      computeEffectiveTypeChange(['string', 'number'], ['string', 'boolean'])
    ).toEqual({
      expanded: true,
      narrowed: true,
    });
  });
});

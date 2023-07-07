import { jest, test, expect, describe } from '@jest/globals';
import { ChangeType, IChange } from '@useoptic/openapi-utilities';
import { newExemptionsCount } from '../count-exemptions';

describe('newExemptionsCount', () => {
  test('exemption added', () => {
    const change = {
      changeType: ChangeType.Added,
      added: {
        'x-optic-exemptions': ['test1', 'test2'],
      },
    };
    expect(newExemptionsCount(change as any)).toBe(2);
  });

  test('exemption changed', () => {
    const change = {
      changeType: ChangeType.Changed,
      changed: {
        before: {
          'x-optic-exemptions': 'test1',
        },
        after: {
          'x-optic-exemptions': ['test1', 'test2', 'test3'],
        },
      },
    };
    expect(newExemptionsCount(change as any)).toBe(2);
  });
});

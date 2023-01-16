import { describe, test, expect } from '@jest/globals';
import { getApiFromOpticUrl } from '../cloud-urls';

describe('getApiFromOpticUrl', () => {
  test('valid urls', () => {
    expect(
      getApiFromOpticUrl(
        'https://app.useoptic.com/organizations/org-id/apis/api-id'
      )
    ).toBe('api-id');
    expect(
      getApiFromOpticUrl(
        'https://app.useoptic.com/organizations/8b4205c4-b895-43ba-a811-f957129aee8a/apis/CcpJ9-hzsOMKPlY_64B1E'
      )
    ).toBe('CcpJ9-hzsOMKPlY_64B1E');
    expect(
      getApiFromOpticUrl(
        'http://localhost:3000/organizations/Pr4UU4kxE2Npf6BlFIh8n/apis/CcpJ9-hzsOMKPlY_64B1E'
      )
    ).toBe('CcpJ9-hzsOMKPlY_64B1E');
  });

  test('invalid urls', () => {
    expect(
      getApiFromOpticUrl(
        'asd/organizations/Pr4UU4kxE2Npf6BlFIh8n/apis/CcpJ9-hzsOMKPlY_64B1E'
      )
    ).toBe(null);
    expect(
      getApiFromOpticUrl(
        'https://app.useoptic.com/organizations/org-id/specs/api-id'
      )
    ).toBe(null);
  });
});

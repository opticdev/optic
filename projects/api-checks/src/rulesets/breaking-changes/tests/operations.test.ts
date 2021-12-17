import { rules } from '../operations';

import { createTestFixture } from './fixtures';
const { compare } = createTestFixture();

describe('operationId', () => {
  const baseForOperationIdTests = {
    openapi: '3.0.1',
    paths: {
      '/example': {
        get: {
          responses: {},
        },
      },
    },
    info: { version: '0.0.0', title: 'Empty' },
  };

  it('fails if removed', async () => {
    const baseCopy = JSON.parse(JSON.stringify(baseForOperationIdTests));
    baseCopy.paths['/example'].get.operationId = 'example';
    const result = await compare(baseCopy)
      .to((spec) => {
        delete spec.paths!['/example']!.get!.operationId;
        return spec;
      })
      .withRule(rules.removingOperationId, {});

    expect(result.results[0].passed).toBeFalsy();
    expect(result).toMatchSnapshot();
  });

  it('fails if changed', async () => {
    // todo: fix copy/paste
    const baseCopy = JSON.parse(JSON.stringify(baseForOperationIdTests));
    baseCopy.paths['/example'].get.operationId = 'example';
    const result = await compare(baseCopy)
      .to((spec) => {
        spec.paths!['/example']!.get!.operationId = 'example2';
        return spec;
      })
      .withRule(rules.removingOperationId, {});

    expect(result.results[0].passed).toBeFalsy();
    expect(result).toMatchSnapshot();
  });
});

const baseForOperationMetadataTests = {
  openapi: '3.0.1',
  paths: {
    '/example': {
      get: {
        tags: ['Example'],
        operationId: 'getExample',
        summary: 'Retrieve example',
        responses: {},
      },
    },
  },
  info: { version: '0.0.0', title: 'Empty' },
};

describe('operation parameters', () => {
  describe('status codes', () => {
    it('fails when a status codes is removed', async () => {
      const base = JSON.parse(JSON.stringify(baseForOperationMetadataTests));
      base.paths['/example'].get.responses = {
        '200': {
          description: 'Example response',
        },
      };
      const result = await compare(base)
        .to((spec) => {
          delete spec.paths!['/example']!.get!.responses!['200'];
          return spec;
        })
        .withRule(rules.preventRemovingStatusCodes, {});

      expect(result.results[0].passed).toBeFalsy();
      expect(result).toMatchSnapshot();
    });
  });
});

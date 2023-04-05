import { it, expect, describe } from '@jest/globals';
import { OpenAPITraverser } from '../openapi-traverser';
import fs from 'node:fs/promises';

const jsonFromFile = async (p: string) => {
  const contents = await fs.readFile(p, 'utf-8');
  return JSON.parse(contents);
};

it('can extract facts from specs', async () => {
  const traverser = new OpenAPITraverser();
  const spec = await jsonFromFile(
    './inputs/openapi3/petstore0.json.flattened-without-sourcemap.json'
  );
  traverser.traverse(spec);
  expect([...traverser.facts()]).toMatchSnapshot();
});

it('will extract facts for oneOf, allOf or anyOf schemas', async () => {
  const traverser = new OpenAPITraverser();
  const spec = await jsonFromFile('./inputs/openapi3/polymorphic-schemas.json');
  traverser.traverse(spec);
  expect([...traverser.facts()]).toMatchSnapshot();
});

it('will work with 3.1 schemas', async () => {
  const traverser = new OpenAPITraverser();
  const spec = await jsonFromFile(
    './inputs/openapi3/polymorphic-schemas-3_1.json'
  );
  traverser.traverse(spec);
  expect([...traverser.facts()]).toMatchSnapshot();
});

it('can extract body example facts from specs', async () => {
  const traverser = new OpenAPITraverser();
  const spec = await jsonFromFile(
    './inputs/openapi3/operation-examples-without-schemas.json'
  );
  traverser.traverse(spec);
  expect([...traverser.facts()]).toMatchSnapshot();
});

it('can extract component schema example facts from specs', async () => {
  const traverser = new OpenAPITraverser();
  const spec = await jsonFromFile(
    './inputs/openapi3/component-schema-examples.json'
  );
  traverser.traverse(spec);
  expect([...traverser.facts()]).toMatchSnapshot();
});

it('handles example schemas as strings', () => {
  const traverser = new OpenAPITraverser();
  const spec: any = {
    openapi: '3.0.1',
    paths: {
      '/example': {
        patch: {
          responses: {
            '200': {
              description: 'hello',
              content: {
                'application/json': {
                  example: 'hello',
                  schema: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
      },
    },
    info: {
      version: '0.0.0',
      title: 'Empty',
    },
  };

  traverser.traverse(spec);
  expect([...traverser.facts()]).toMatchSnapshot();
});

describe('supports 3.0 and 3.1 schema fact generation', () => {
  const traverser = new OpenAPITraverser();

  it('produces correct fact for 3.0 nullable', () => {
    expect(
      traverser.getSchemaFact({
        type: 'string',
        nullable: true,
      })
    ).toEqual({ type: ['string', 'null'] });
  });

  it('produces correct fact for 3.1 with null', () => {
    expect(
      traverser.getSchemaFact({
        type: ['string', 'null'],
      })
    ).toEqual({ type: ['string', 'null'] });
  });

  it('produces correct fact for 3.1 with and type array', () => {
    expect(
      traverser.getSchemaFact({
        type: ['string', 'number'],
      })
    ).toEqual({ type: ['string', 'number'] });
  });
  it('produces correct fact for 3.0 nullable with no type', () => {
    expect(
      traverser.getSchemaFact({
        nullable: true,
      })
    ).toEqual({ type: ['null'] });
  });
  it('produces correct fact for any', () => {
    expect(traverser.getSchemaFact({})).toEqual({});
  });
});

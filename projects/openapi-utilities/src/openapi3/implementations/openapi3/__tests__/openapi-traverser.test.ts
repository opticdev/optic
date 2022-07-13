import { OpenAPITraverser } from '../openapi-traverser';
import fs from 'fs-extra';

const jsonFromFile = async (path: string) => {
  const bytes = await fs.readJson(path);
  return bytes;
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
    ).toMatchSnapshot();
  });

  it('produces correct fact for 3.1 with null', () => {
    expect(
      traverser.getSchemaFact({
        type: ['string', 'null'],
      })
    ).toMatchSnapshot();
  });

  it('produces correct fact for 3.1 with and type array', () => {
    expect(
      traverser.getSchemaFact({
        type: ['string', 'number'],
      })
    ).toMatchSnapshot();
  });
  it('produces correct fact for 3.0 nullable with no type', () => {
    expect(
      traverser.getSchemaFact({
        nullable: true,
      })
    ).toMatchSnapshot();
  });
  it('produces correct fact for any', () => {
    expect(traverser.getSchemaFact({})).toMatchSnapshot();
  });
});

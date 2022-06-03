import {
  dereferenceOpenAPI,
  ParseOpenAPIResult,
  parseOpenAPIWithSourcemap,
} from './openapi-sourcemap-parser';
import path from 'path';
import sortBy from 'lodash.sortby';

const cwd = process.cwd();

function prepSnapshot(result: ParseOpenAPIResult) {
  result.sourcemap.files.forEach((i) => {
    i.path = i.path.split(cwd)[1];
    // @ts-ignore
    i.index = null;
    // @ts-ignore
    i.ast = null;
  });

  result.sourcemap.rootFilePath = result.sourcemap.rootFilePath.split(cwd)[1];

  result.sourcemap.files = sortBy(result.sourcemap.files, 'path');

  return result;
}

it('can deference a json schema spec with references', async () => {
  const results = await dereferenceOpenAPI({
    openapi: '3.0.1',
    paths: {
      '/abc': {
        get: {
          responses: {
            '400': {
              $ref: 'https://raw.githubusercontent.com/snyk/sweater-comb/v1.2.0/components/responses/400.yaml#/400',
            },
          },
        },
      },
    },
    info: {
      version: '0.0.0',
      title: 'Empty',
    },
  });

  expect(results.jsonLike).toMatchSnapshot();
});

it('can parse a json schema spec with external references', async () => {
  const results = await parseOpenAPIWithSourcemap(
    path.resolve(
      path.join(
        __dirname,
        '../../inputs/openapi3-with-references/external-multiple.yaml'
      )
    )
  );

  expect(prepSnapshot(results)).toMatchSnapshot();
});

it('can parse a json schema spec with internal references to external references', async () => {
  const results = await parseOpenAPIWithSourcemap(
    path.resolve(
      path.join(
        __dirname,
        '../../inputs/openapi3-with-references/internal-multiple.yaml'
      )
    )
  );

  expect(prepSnapshot(results)).toMatchSnapshot();
});

it('can parse a json schema spec with external references to the same file', async () => {
  const results = await parseOpenAPIWithSourcemap(
    path.resolve(
      path.join(
        __dirname,
        '../../inputs/openapi3-with-references/external-multiple-branches.yaml'
      )
    )
  );
  expect(prepSnapshot(results)).toMatchSnapshot();
});

it('can parse an OpenAPI file and have valid sourcemap', async () => {
  const results = await parseOpenAPIWithSourcemap(
    path.resolve(path.join(__dirname, '../../inputs/openapi3/petstore0.json'))
  );
  expect(prepSnapshot(results)).toMatchSnapshot();
});

it('can parse an OpenAPI file with nested URLs from file or git', async () => {
  const fileResults = await parseOpenAPIWithSourcemap(
    path.resolve(
      path.join(__dirname, '../../inputs/openapi3/000-baseline.yaml')
    )
  );

  expect(fileResults.jsonLike).toMatchSnapshot();
});

it('can parse an OpenAPI file with nested URLs from file or git', async () => {
  const fileResults = await parseOpenAPIWithSourcemap(
    path.resolve(
      path.join(__dirname, '../../inputs/openapi3/empty-with-url-ref.json')
    )
  );

  expect(fileResults.jsonLike).toMatchSnapshot();
});

it('can generate a sourcemap and jsonLike that is serializable', async () => {
  const fileResults = await parseOpenAPIWithSourcemap(
    path.resolve(
      path.join(__dirname, '../../inputs/openapi3/empty-with-url-ref.json')
    )
  );

  JSON.stringify(fileResults);
});

describe('circular references', () => {
  test('can derefence circular references', async () => {
    const fileResults = await parseOpenAPIWithSourcemap(
      path.resolve(
        path.join(
          __dirname,
          '../../inputs/openapi3-with-references/circular-references.yaml'
        )
      )
    );

    JSON.stringify(fileResults.jsonLike);
    expect(fileResults.jsonLike).toMatchSnapshot();
  });

  test('circular references with chained circle ref', async () => {
    const fileResults = await parseOpenAPIWithSourcemap(
      path.resolve(
        path.join(
          __dirname,
          '../../inputs/openapi3-with-references/circular-references-multiple-chain.yaml'
        )
      )
    );

    // the resulting spec should be serializable
    JSON.stringify(fileResults.jsonLike);
    expect(fileResults.jsonLike).toMatchSnapshot();
  });

  test('circular references with expanded refs', async () => {
    const fileResults = await parseOpenAPIWithSourcemap(
      path.resolve(
        path.join(
          __dirname,
          '../../inputs/openapi3-with-references/circular-references-with-expanded-refs.yaml'
        )
      )
    );

    JSON.stringify(fileResults.jsonLike);
    expect(fileResults.jsonLike).toMatchSnapshot();
  });

  test('circular references with multiple refs', async () => {
    const fileResults = await parseOpenAPIWithSourcemap(
      path.resolve(
        path.join(
          __dirname,
          '../../inputs/openapi3-with-references/circular-references-multiple-refs.yaml'
        )
      )
    );

    JSON.stringify(fileResults.jsonLike);
    expect(fileResults.jsonLike).toMatchSnapshot();
  });
});

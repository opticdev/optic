import { it, test, expect, describe } from '@jest/globals';
import {
  dereferenceOpenApi,
  ParseOpenAPIResult,
  parseOpenAPIWithSourcemap,
} from '../openapi-sourcemap-parser';
import path from 'path';

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

  result.sourcemap.files = result.sourcemap.files.sort((a, b) =>
    a.path.toLocaleLowerCase().localeCompare(b.path.toLocaleLowerCase())
  );

  return result;
}

describe('dereferencing openapi files', () => {
  it('can parse a json schema spec with external references', async () => {
    const results = await parseOpenAPIWithSourcemap(
      path.resolve(
        path.join(
          __dirname,
          '../../../inputs/openapi3-with-references/external-multiple.yaml'
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
          '../../../inputs/openapi3-with-references/internal-multiple.yaml'
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
          '../../../inputs/openapi3-with-references/external-multiple-branches.yaml'
        )
      )
    );
    expect(prepSnapshot(results)).toMatchSnapshot();
  });

  it('can parse an OpenAPI file and have valid sourcemap', async () => {
    const results = await parseOpenAPIWithSourcemap(
      path.resolve(
        path.join(__dirname, '../../../inputs/openapi3/petstore0.json')
      )
    );
    expect(prepSnapshot(results)).toMatchSnapshot();
  });

  it('can parse an OpenAPI file with nested external urls', async () => {
    const fileResults = await parseOpenAPIWithSourcemap(
      path.resolve(
        path.join(__dirname, '../../../inputs/openapi3/000-baseline.yaml')
      )
    );

    expect(fileResults.jsonLike).toMatchSnapshot();
  });

  it('can parse an OpenAPI file with local files and external urls', async () => {
    const fileResults = await parseOpenAPIWithSourcemap(
      path.resolve(
        path.join(
          __dirname,
          '../../../inputs/openapi3/001-ok-add-property-field.yaml'
        )
      )
    );

    expect(fileResults.jsonLike).toMatchSnapshot();
  });

  it('can parse an OpenAPI file with an empty url ref', async () => {
    const fileResults = await parseOpenAPIWithSourcemap(
      path.resolve(
        path.join(__dirname, '../../../inputs/openapi3/empty-with-url-ref.json')
      )
    );

    expect(fileResults.jsonLike).toMatchSnapshot();
  });

  it('can generate a sourcemap and jsonLike that is serializable', async () => {
    const fileResults = await parseOpenAPIWithSourcemap(
      path.resolve(
        path.join(__dirname, '../../../inputs/openapi3/empty-with-url-ref.json')
      )
    );

    JSON.stringify(fileResults);
  });
});

describe('dereferencing openapi files with external file resolver', () => {
  test('uses a custom ref handler to replace non-url refs', async () => {
    const fileResults = await dereferenceOpenApi('file_doesnt_matter', {
      externalRefHandler: {
        order: 1,
        canRead: () => true,
        read: (file) => {
          return Promise.resolve(
            JSON.stringify(
              file.url.endsWith('file_doesnt_matter')
                ? {
                    value: {
                      $ref: './is_on_fs.json',
                    },
                  }
                : {
                    value_inside: 'it is inside',
                  }
            )
          );
        },
      },
    });

    expect(fileResults.jsonLike).toMatchSnapshot();
  });
});

describe('circular references', () => {
  test('can derefence circular references', async () => {
    const fileResults = await parseOpenAPIWithSourcemap(
      path.resolve(
        path.join(
          __dirname,
          '../../../inputs/openapi3-with-references/circular-references.yaml'
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
          '../../../inputs/openapi3-with-references/circular-references-multiple-chain.yaml'
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
          '../../../inputs/openapi3-with-references/circular-references-with-expanded-refs.yaml'
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
          '../../../inputs/openapi3-with-references/circular-references-multiple-refs.yaml'
        )
      )
    );

    JSON.stringify(fileResults.jsonLike);
    expect(fileResults.jsonLike).toMatchSnapshot();
  });

  test('does not parse date strings as JS dates', async () => {
    const fileResults = await parseOpenAPIWithSourcemap(
      path.resolve(path.join(__dirname, '../../../inputs/date-example.yml'))
    );

    JSON.stringify(fileResults.jsonLike);
    expect(fileResults.jsonLike).toMatchSnapshot();
  });
});

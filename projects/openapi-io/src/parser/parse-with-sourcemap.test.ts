import {
  parseOpenAPIFromRepoWithSourcemap,
  ParseOpenAPIResult,
  parseOpenAPIWithSourcemap,
} from './openapi-sourcemap-parser';
import path from 'path';
import sortBy from 'lodash.sortby';
import { inGit } from '../index';
import invariant from 'ts-invariant';

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

  // const abc = sourcemapReader(results.sourcemap).findFile(
  //   "/example/internalRef/example/example/name"
  // );
  // console.log(abc);

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
      path.join(__dirname, '../../inputs/openapi3/empty-with-url-ref.json')
    )
  );

  expect(fileResults.jsonLike).toMatchSnapshot();

  // these would require the whole repo to be checked out

  // const gitRepo = await inGit(process.cwd());
  // invariant(gitRepo);
  //
  // const gitDatabaseObjectsResults = await parseOpenAPIFromRepoWithSourcemap(
  //   'projects/openapi-workspaces/projects/openapi-io/inputs/openapi3/empty-with-url-ref.json',
  //   gitRepo,
  //   'master'
  // );
  //
  // expect(gitDatabaseObjectsResults.jsonLike).toMatchSnapshot();
});

//
// it("can parse a real schema spec with external references, resolved in any order", async () => {
//   const results = await parseOpenAPIWithSourcemap(
//     path.resolve(
//       path.join(
//         __dirname,
//         "../../../snyk-rules/end-end-tests/api-standards/resources/thing/2021-11-10/001-ok-add-property-field.yaml"
//       )
//     )
//   );
//
//   expect(prepSnapshot(results)).toMatchSnapshot();
// });

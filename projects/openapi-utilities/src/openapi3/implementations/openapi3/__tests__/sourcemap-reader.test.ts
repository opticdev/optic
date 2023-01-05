// TODO get rid of fixture import so we don't have circular references
import { parseOpenAPIWithSourcemap } from '../../../../../../openapi-io/src/parser/openapi-sourcemap-parser';
import { it, expect, describe } from '@jest/globals';
import path from 'path';
import { sourcemapReader } from '../sourcemap-reader';
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const fixture = async () => {
  return await parseOpenAPIWithSourcemap(
    path.resolve(
      path.join(
        __dirname,
        '../../../../../../openapi-io/inputs/openapi3-with-references/external-multiple.yaml'
      )
    )
  );
};

async function stripCwd(file: string) {
  const { stdout } = await exec('git rev-parse --show-toplevel');
  return (
    file
      .replace(stdout.trim(), '')
      // strip out monorail prefixes
      .replace('/projects/openapi-workspaces', '')
  );
}

describe('reading sourcemaps', () => {
  it('can get file path of forign file for any pointer relative to flattened json', async () => {
    const results = await fixture();

    const node = sourcemapReader(results.sourcemap).findFile(
      '/properties/user/example/name'
    );
    expect(node?.filePath.endsWith('definitions.yaml')).toBeTruthy();
    expect(await stripCwd(node!.filePath)).toMatchSnapshot();
  });

  it('can get file paths json pointer in main file relative to flattened json', async () => {
    const results = await fixture();

    const node = sourcemapReader(results.sourcemap).findFile('/properties');

    expect(node!.filePath.endsWith('external-multiple.yaml')).toBeTruthy();
    expect(await stripCwd(node!.filePath)).toMatchSnapshot();
  });

  it('lines in affected file for sub-property', async () => {
    const results = await fixture();

    const node = await sourcemapReader(results.sourcemap).findFileAndLines(
      '/properties/user/example/name'
    );
    node!.filePath = await stripCwd(node!.filePath);
    expect(node).toMatchSnapshot();
  });

  it('lines in affected for object', async () => {
    const results = await fixture();

    const node = await sourcemapReader(results.sourcemap).findFileAndLines(
      '/properties'
    );

    node!.filePath = await stripCwd(node!.filePath);
    expect(node).toMatchSnapshot();
  });

  it('resolve a large sampling of known-valid keys', async () => {
    const results = await parseOpenAPIWithSourcemap(
      path.resolve(
        path.join(
          __dirname,
          '../../../../../../openapi-io/inputs/openapi3/001-ok-add-property-field.yaml'
        )
      )
    );

    const knownValid = [
      '/paths/~1thing~1{thing_id}/patch/responses/200/content/application~1vnd.api+json/schema/properties/data/properties/attributes/properties/description',
      '/paths/~1thing~1{thing_id}/patch/responses/200/content/application~1vnd.api+json/schema/properties/data/properties/attributes/properties/created',
      '/paths/~1thing~1{thing_id}/patch/responses/409/content/application~1vnd.api+json/schema/properties/jsonapi',
      '/paths/~1thing~1{thing_id}/patch/responses/400/content/application~1vnd.api+json/schema/properties/jsonapi',
      '/paths/~1thing/get/responses/404/content/application~1vnd.api+json/schema/properties/errors',
      '/paths/~1thing~1{thing_id}/delete/responses/401/content/application~1vnd.api+json/schema/properties/errors',
      '/paths/~1thing~1{thing_id}/delete/responses/403/content/application~1vnd.api+json/schema/properties/jsonapi/properties/version',
      '/paths/~1thing~1{thing_id}/get/responses/400/headers/snyk-version-served',
      '/paths/~1thing~1{thing_id}/patch/responses/404/content/application~1vnd.api+json/schema/properties/errors/items/properties/id',
      '/paths/~1thing~1{thing_id}/delete/responses/401/content/application~1vnd.api+json/schema/properties/jsonapi',
      '/paths/~1thing/get/responses/500/content/application~1vnd.api+json/schema/properties/errors',
      '/paths/~1thing/post/responses/409/content/application~1vnd.api+json/schema/properties/jsonapi',
      '/paths/~1thing~1{thing_id}/patch/responses/401/content/application~1vnd.api+json/schema/properties/errors/items/properties/status',
      '/paths/~1thing~1{thing_id}/get/responses/403/content/application~1vnd.api+json/schema/properties/errors/items/properties/source/properties/pointer',
      '/paths/~1thing/get/responses/200/content/application~1vnd.api+json/schema/properties/data/items/properties/attributes/properties/description',
      '/paths/~1thing~1{thing_id}/delete/responses/403/content/application~1vnd.api+json/schema/properties/errors/items/properties/detail',
      '/paths/~1thing~1{thing_id}/patch/responses/500/content/application~1vnd.api+json/schema/properties/errors/items/properties/source/properties/parameter',
      '/paths/~1thing/get/responses/200/content/application~1vnd.api+json/schema/properties/data/items/properties/relationships',
      '/paths/~1thing~1{thing_id}/get/responses/500/content/application~1vnd.api+json/schema/properties/errors/items/properties/id',
      '/paths/~1thing~1{thing_id}/patch/responses/404/content/application~1vnd.api+json/schema/properties/errors/items/properties/detail',
      '/paths/~1thing~1{thing_id}/patch/responses/500/content/application~1vnd.api+json/schema/properties/errors/items/properties/source',
      '/paths/~1thing~1{thing_id}/delete/responses/404/content/application~1vnd.api+json/schema/properties/errors/items/properties/id',
      '/paths/~1thing~1{thing_id}/get/responses/403/headers/snyk-version-served',
      '/paths/~1thing/post/responses/403/content/application~1vnd.api+json/schema/properties/errors/items/properties/source/properties/parameter',
      '/paths/~1thing/get/responses/404/content/application~1vnd.api+json/schema/properties/errors/items/properties/source/properties/pointer',
      '/paths/~1thing~1{thing_id}/get/responses/400/headers/snyk-request-id',
      '/paths/~1thing/post/responses/404/content/application~1vnd.api+json/schema/properties/errors/items/properties/detail',
      '/paths/~1thing~1{thing_id}/get/responses/500/content/application~1vnd.api+json/schema/properties/jsonapi/properties/version',
      '/paths/~1thing~1{thing_id}/get/responses/500/content/application~1vnd.api+json/schema/properties/errors',
      '/paths/~1thing~1{thing_id}/delete/responses/400/content/application~1vnd.api+json/schema/properties/jsonapi',
      '/paths/~1thing~1{thing_id}/patch/responses/401/content/application~1vnd.api+json/schema/properties/errors/items/properties/source',
      '/paths/~1thing/get/responses/200/content/application~1vnd.api+json/schema/properties/data/items/properties/relationships/properties/example',
      '/paths/~1thing~1{thing_id}/get/responses/200/content/application~1vnd.api+json/schema/properties/data/properties/relationships/properties/example/properties/links/properties/related',
      '/paths/~1thing~1{thing_id}/delete/responses/500/content/application~1vnd.api+json/schema/properties/errors/items/properties/status',
      '/paths/~1thing~1{thing_id}/patch/responses/401/content/application~1vnd.api+json/schema/properties/jsonapi/properties/version',
      '/paths/~1thing~1{thing_id}/delete/responses/500/headers/deprecation',
      '/paths/~1thing/get/responses/404/content/application~1vnd.api+json/schema/properties/errors/items/properties/id',
      '/paths/~1thing~1{thing_id}/patch/responses/403/headers/snyk-version-served',
      '/paths/~1thing~1{thing_id}/delete/responses/403/content/application~1vnd.api+json/schema/properties/errors/items/properties/meta',
      '/paths/~1thing~1{thing_id}/patch/responses/401/content/application~1vnd.api+json/schema/properties/errors/items/properties/source/properties/pointer',
      '/paths/~1thing~1{thing_id}/delete/responses/500/content/application~1vnd.api+json/schema/properties/errors/items/properties/source/properties/pointer',
      '/paths/~1thing~1{thing_id}/delete/responses/400/content/application~1vnd.api+json/schema/properties/errors/items/properties/id',
      '/paths/~1thing/get/responses/404/headers/deprecation',
      '/paths/~1thing~1{thing_id}/patch/responses/404/content/application~1vnd.api+json/schema/properties/errors/items/properties/detail',
      '/paths/~1thing/get/responses/400/headers/snyk-version-lifecycle-stage',
      '/paths/~1thing~1{thing_id}/get/responses/404/headers/snyk-request-id',
      '/paths/~1thing/post/responses/409/content/application~1vnd.api+json/schema/properties/errors/items/properties/source/properties/pointer',
      '/paths/~1thing~1{thing_id}/delete/responses/400/content/application~1vnd.api+json/schema/properties/errors/items/properties/id',
      '/paths/~1thing/post/responses/404/content/application~1vnd.api+json/schema/properties/errors',
      '/paths/~1thing~1{thing_id}/get/responses/401/content/application~1vnd.api+json/schema/properties/jsonapi/properties/version',
    ];

    //
    const allResolved = await Promise.all(
      knownValid.map(async (i) => {
        const a = await sourcemapReader(results.sourcemap).findFileAndLines(i);
        const lastIndex = a!.filePath.lastIndexOf('/');
        a!.filePath = a!.filePath.substring(lastIndex);
        return a;
      })
    );

    expect(allResolved).toMatchSnapshot();
    expect(allResolved.every((i) => Boolean(i)));
  });
});

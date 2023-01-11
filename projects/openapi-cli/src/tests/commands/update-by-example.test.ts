import { it, describe, expect } from '@jest/globals';
import { updateByExample } from '../../commands/update-by-example';
import Path from 'path';
import { collect } from '../../lib/async-tools';

describe('update-by-example command', () => {
  it('will return an error when trying to update and non-existent spec', async () => {
    const path = Path.join(__dirname, 'a-file-that-doesn-exist.yml');

    const results = await updateByExample(path);

    expect(results.err).toBe(true);
  });

  it('can generate update spec files for component schemas by example', async () => {
    const path = Path.join(
      __dirname,
      '../../../../openapi-utilities/inputs/openapi3/component-schema-examples.json'
    );

    const results = await updateByExample(path);
    const { stats, results: updatedSpecFiles } = results.expect(
      'example spec can be read and processed'
    );

    let specFiles = await collect(updatedSpecFiles);

    expect(specFiles).toHaveLength(1);
    expect(specFiles.map((file) => file.contents)).toMatchSnapshot();
    expect(stats).toMatchSnapshot();
  });

  it('can generate update spec files for request / response examples with partial schemas', async () => {
    const path = Path.join(
      __dirname,
      '../../../../openapi-utilities/inputs/openapi3/operation-examples-with-partial-schemas.json'
    );

    const results = await updateByExample(path);
    const { stats, results: updatedSpecFiles } = results.expect(
      'example spec can be read and processed'
    );

    let specFiles = await collect(updatedSpecFiles);

    expect(specFiles).toHaveLength(1);
    expect(specFiles.map((file) => file.contents)).toMatchSnapshot();
    expect(stats).toMatchSnapshot();
  });
});

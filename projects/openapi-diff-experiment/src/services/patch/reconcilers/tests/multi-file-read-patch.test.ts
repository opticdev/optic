import path from 'path';
import { createOpenApiFileSystemReader } from '../../../read/read';
import { StringifyReconciler } from '../stringify-reconciler';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { PatchesToSave } from '../../incremental-json-patch/json-patcher';

const filePathJson = path.join(__dirname, 'example', 'with-body-ref.json');
const filePathYaml = path.join(__dirname, 'example', 'with-body-ref.yaml');

describe('multi file read patch', () => {
  it('can parse an OpenAPI across file system from root', async () => {
    const reader = createOpenApiFileSystemReader(filePathJson);
    expect(await reader.flattenedSpecification()).toMatchSnapshot();
  });

  it('can parse an OpenAPI from both yaml and json', async () => {
    const reader = createOpenApiFileSystemReader(filePathYaml);
    expect(await reader.flattenedSpecification()).toMatchSnapshot();
  });

  it('can group json patches by their respective files', async () => {
    const reader = createOpenApiFileSystemReader(filePathJson);

    const result = await StringifyReconciler(reader).patchesToFileMutations(
      crossFilePatch
    );

    const resultCleaned = result.files.map((i) => {
      const parsed = path.parse(i.path);
      return { ...i, path: `${parsed.name}${parsed.ext}` };
    });

    expect(resultCleaned).toMatchSnapshot();
  });

  it('can group json patches by their respective files across YAML & JSON dependencies', async () => {
    const reader = createOpenApiFileSystemReader(filePathYaml);

    const result = await StringifyReconciler(reader).patchesToFileMutations(
      crossFilePatch
    );

    const resultCleaned = result.files.map((i) => {
      const parsed = path.parse(i.path);
      return { ...i, path: `${parsed.name}${parsed.ext}` };
    });

    expect(resultCleaned).toMatchSnapshot();
  });
});

const response200Path = jsonPointerHelpers.compile([
  'paths',
  '/example',
  'get',
  'responses',
  '200',
]);

const crossFilePatch: PatchesToSave<any> = {
  patches: [
    {
      intent: 'add new field',
      patches: [
        {
          path: jsonPointerHelpers.append(
            response200Path,
            'content',
            'application/json',
            'schema',
            'properties',
            'newOne'
          ),
          value: { type: 'string' },
          op: 'add',
        },
        {
          path: jsonPointerHelpers.append(
            response200Path,
            'content',
            'application/json',
            'schema',
            'required',
            '-'
          ),
          value: 'newOne',
          op: 'add',
        },
      ],
    },
    {
      intent: 'add description for response',
      patches: [
        {
          path: jsonPointerHelpers.append(response200Path, 'description'),
          value: 'HELLO WORLD',
          op: 'replace',
        },
      ],
    },
  ],
  document: {} as any, // this is being removed soon
};

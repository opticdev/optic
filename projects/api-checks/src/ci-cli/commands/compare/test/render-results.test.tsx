import { render } from 'ink-testing-library';
import React from 'react';
import {
  RenderCheckResults,
  SourcemapRendererEnum,
} from '../components/render-results';
import { ResultWithSourcemap } from '../../../../sdk/types';

describe('list of checks', () => {
  it('renders list of checks with local sourcemaps', async () => {
    const { lastFrame } = render(
      <RenderCheckResults
        results={results}
        verbose={true}
        mapToFile={SourcemapRendererEnum.local}
      />
    );
    const output = lastFrame()!;
    const stringified = Buffer.from(output).toString('base64');
    // console.log(lastFrame());
    // jest complains for some reason, and the snapshots aren't consistent.
    expect(stringified).toMatchSnapshot();
    expect(output).toMatchSnapshot();
  });

  it('renders list of checks with github sourcemap', async () => {
    const { lastFrame } = render(
      <RenderCheckResults
        results={results}
        verbose={true}
        mapToFile={SourcemapRendererEnum.github}
      />
    );
    const output = lastFrame()!;
    const stringified = Buffer.from(output).toString('base64');
    console.log(lastFrame());
    // jest complains for some reason, and the snapshots aren't consistent.
    expect(stringified).toMatchSnapshot();
    expect(output).toMatchSnapshot();
  });
});

const results: ResultWithSourcemap[] = [
  {
    sourcemap: {
      filePath: '/example.yaml',
      startPosition: 10,
      startLine: 1,
      endLine: 1,
      endPosition: 30,
    },
    passed: false,
    condition: 'have tags',
    where: 'operation',
    isMust: true,
    isShould: false,
    docsLink:
      'https://github.com/snyk/sweater-comb/blob/main/docs/standards.md#tags',
    error: 'tags [] must be set on each operation: expected undefined to exist',
    change: {
      location: {
        jsonPath: '/paths/example/get',
        conceptualPath: ['operations', '/example', 'get'],
        kind: 'operation',
        conceptualLocation: { method: 'get', path: '/example' },
      } as any,
      // @ts-ignore
      value: {
        operationId: '',
        summary: 'Retrieve example',
        method: 'get',
        pathPattern: '/example',
      },
    },
  },
  {
    sourcemap: {
      filePath: '/example.yaml',
      startPosition: 10,
      startLine: 1,
      endLine: 1,
      endPosition: 30,
    },
    passed: false,
    condition: 'have an operation id',
    where: 'operation',
    isMust: true,
    isShould: false,
    error: 'operation id is missing',
    docsLink:
      'https://github.com/snyk/sweater-comb/blob/main/docs/standards.md#operation-ids',
    change: {
      location: {
        jsonPath: '/paths/example/get',
        conceptualPath: ['operations', '/example', 'get'],
        kind: 'operation',
        conceptualLocation: { method: 'get', path: '/example' },
      } as any,
      // @ts-ignore
      value: {
        operationId: '',
        summary: 'Retrieve example',
        method: 'get',
        pathPattern: '/example',
      },
    },
  },
  {
    sourcemap: {
      filePath: '/example.yaml',
      startPosition: 10,
      startLine: 1,
      endLine: 1,
      endPosition: 30,
    },
    passed: true,
    condition: 'have an operation id',
    where: 'operation',
    isMust: true,
    isShould: false,
    error: 'operation id is missing',
    docsLink:
      'https://github.com/snyk/sweater-comb/blob/main/docs/standards.md#operation-ids',
    change: {
      location: {
        jsonPath: '/paths/example/paths',
        conceptualPath: ['operations', '/example', 'get'],
        kind: 'operation',
        conceptualLocation: { method: 'patch', path: '/example/{}' },
      } as any,
      // @ts-ignore
      value: {
        operationId: '',
        summary: 'Retrieve example',
        method: 'patch',
        pathPattern: '/example/:exampleId',
      },
    },
  },
];

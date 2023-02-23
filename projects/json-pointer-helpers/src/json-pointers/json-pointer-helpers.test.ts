import { describe, it, expect } from '@jest/globals';
import jsonPointerHelpers from './json-pointer-helpers';

describe('json schema pointer helpers', () => {
  it('can compile an array of paths', () => {
    expect(
      jsonPointerHelpers.compile(['/paths/pets/get', 'hello', 'goodbye'])
    ).toMatchSnapshot();
  });

  it('can parse a json pointer into parts', () => {
    expect(
      jsonPointerHelpers.decode('/paths/~1user~1{username}/get')
    ).toMatchSnapshot();
  });

  it('handles empty compiles', () => {
    expect(jsonPointerHelpers.compile([])).toBe('');
  });

  it('appends are escaped', () => {
    expect(
      jsonPointerHelpers.append('/paths', '/example/{todoId}', 'get')
    ).toMatchSnapshot();
  });

  it('can unescapeUriSafePointer', () => {
    const result = jsonPointerHelpers.unescapeUriSafePointer(
      '#/paths/~1pet~1%7BpetId%7D~1uploadImage/post/responses/200/content/application~1json/schema/properties'
    );
    expect(result).toMatchSnapshot();
  });
});

describe('relative', () => {
  it('can make pointer relative', () => {
    const a = jsonPointerHelpers.compile(['paths', '/example', 'schema']);
    const b = jsonPointerHelpers.compile([
      'paths',
      '/example',
      'schema',
      'start-trek',
      'voyager',
    ]);

    expect(jsonPointerHelpers.relative(b, a)).toMatchSnapshot();
  });

  it('throws if improper lineage make pointer relative', () => {
    const a = jsonPointerHelpers.compile(['paths', '/example', 'schema']);
    const b = jsonPointerHelpers.compile([
      'other-place',
      'start-trek',
      'voyager',
    ]);

    expect(() =>
      jsonPointerHelpers.relative(b, a)
    ).toThrowErrorMatchingSnapshot();
  });

  it('throws if improper lineage make pointer relative', () => {
    const a = jsonPointerHelpers.compile([
      'paths',
      '/example',
      'schema',
      'start-trek',
      'voyager',
      'season-1',
    ]);
    const b = jsonPointerHelpers.compile([
      'paths',
      '/example',
      'schema',
      'start-trek',
      'voyager',
    ]);

    expect(() =>
      jsonPointerHelpers.relative(b, a)
    ).toThrowErrorMatchingSnapshot();
  });
});

describe('get', () => {
  it('gets an object', () => {
    expect(
      jsonPointerHelpers.get(
        {
          a: {
            b: {
              3: {
                the: 'bc',
                be: '123',
              },
            },
          },
        },
        '/a/b/3'
      )
    ).toMatchSnapshot();
  });
});

describe('matchers', () => {
  const exampleOperation = jsonPointerHelpers.compile([
    'paths',
    '/me/{them}',
    'get',
  ]);
  const info = jsonPointerHelpers.compile(['info']);

  it('can match startsWith when using constants', () => {
    expect(jsonPointerHelpers.startsWith(exampleOperation, ['info'])).toBe(
      false
    );
    expect(jsonPointerHelpers.startsWith(exampleOperation, ['paths'])).toBe(
      true
    );

    expect(
      jsonPointerHelpers.startsWith(exampleOperation, ['paths', '/me/{them}'])
    ).toBe(true);
    expect(
      jsonPointerHelpers.startsWith(exampleOperation, ['paths', '/me'])
    ).toBe(false);
  });

  it('can match startsWith when using globs', () => {
    expect(jsonPointerHelpers.startsWith(exampleOperation, ['*'])).toBe(true);
    expect(
      jsonPointerHelpers.startsWith(exampleOperation, ['paths', '**'])
    ).toBe(true);
  });
  it('can match startsWith at size bounds', () => {
    expect(jsonPointerHelpers.startsWith(info, ['info', 'contact'])).toBe(
      false
    );
    expect(jsonPointerHelpers.startsWith(info, [])).toBe(true);
  });

  it('can match endsWith when using constants', () => {
    expect(jsonPointerHelpers.endsWith(exampleOperation, ['post'])).toBe(false);
    expect(jsonPointerHelpers.endsWith(exampleOperation, ['get'])).toBe(true);

    expect(
      jsonPointerHelpers.endsWith(exampleOperation, ['/me/{them}', 'get'])
    ).toBe(true);
    expect(
      jsonPointerHelpers.endsWith(exampleOperation, ['/me/{them}', 'post'])
    ).toBe(false);
  });

  it('can match endsWith when using globs', () => {
    expect(
      jsonPointerHelpers.endsWith(exampleOperation, ['paths', '**', 'get'])
    ).toBe(true);
    expect(
      jsonPointerHelpers.endsWith(exampleOperation, ['paths', '**', 'post'])
    ).toBe(false);
  });
  it('can match endsWith at size bounds', () => {
    expect(jsonPointerHelpers.endsWith(info, ['info'])).toBe(true);
    expect(jsonPointerHelpers.endsWith(info, ['info', 'contact'])).toBe(false);
  });
});

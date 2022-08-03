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

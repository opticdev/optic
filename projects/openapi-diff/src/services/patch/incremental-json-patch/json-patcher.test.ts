import { jsonPatcher } from './json-patcher';

describe('json patcher', () => {
  const example = {
    favorite: {
      color: 'red',
    },
  };

  it('valid patches apply', () => {
    const patcher = jsonPatcher(example);

    const result = patcher.apply('add city', [
      { path: '/favorite/city', op: 'add', value: 'Philadelphia' },
    ]);

    expect(result.success).toBeTruthy();
    expect(patcher.currentDocument()).toMatchSnapshot();
  });

  it('invalid patches do not apply', () => {
    const patcher = jsonPatcher(example);

    const result = patcher.apply('add city', [
      { path: '/favorite/city/0', op: 'add', value: 'Philadelphia' },
    ]);

    expect(result.success).toBeFalsy();
    expect(result).toMatchSnapshot();
  });

  it('patches can be built up sequentially', () => {
    const patcher = jsonPatcher(example);

    patcher.apply('add city as array', [
      { path: '/favorite/city', op: 'add', value: [] },
    ]);

    patcher.apply('add item to city array', [
      { path: '/favorite/city/0', op: 'add', value: { name: 'Not Right' } },
    ]);

    patcher.apply('rename first city in list', [
      { path: '/favorite/city/0/name', op: 'replace', value: 'Philadelphia' },
    ]);

    expect(patcher.currentDocument()).toMatchSnapshot();
  });
});

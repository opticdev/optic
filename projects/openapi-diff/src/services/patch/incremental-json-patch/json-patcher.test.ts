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

  describe('helper', () => {
    const example = {
      favorite: {
        color: 'red',
      },
    };

    describe('to require an object at a certain key', () => {
      it('works when the key is already an object', () => {
        const patcher = jsonPatcher(example);
        patcher.helper.requiresObjectAt(['favorite']);
        expect(patcher.currentDocument()).toMatchSnapshot();
        expect(patcher.currentPatches()).toMatchSnapshot();
      });
      it('works when the key is not present at root', () => {
        const patcher = jsonPatcher(example);
        patcher.helper.requiresObjectAt(['contacts']);
        expect(patcher.currentDocument()).toMatchSnapshot();
        expect(patcher.currentPatches()).toMatchSnapshot();
      });
      it('works when the key is nested', () => {
        const patcher = jsonPatcher(example);
        patcher.helper.requiresObjectAt(['favorite', 'foods']);
        expect(patcher.currentDocument()).toMatchSnapshot();
        expect(patcher.currentPatches()).toMatchSnapshot();
      });

      it('works when deeply nested ', () => {
        const patcher = jsonPatcher(example);
        patcher.helper.requiresObjectAt(['favorite', 'foods', 'healthy']);
        expect(patcher.currentDocument()).toMatchSnapshot();
        expect(patcher.currentPatches()).toMatchSnapshot();
      });
    });
  });
});

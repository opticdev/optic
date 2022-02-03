import { normalizeJsonPointer } from '../normalize-json-pointer';

describe('normalize json pointer', () => {
  it('works for single array item', () => {
    expect(normalizeJsonPointer('/items/12')).toMatchSnapshot();
  });
  it('works for nested array items', () => {
    expect(
      normalizeJsonPointer('/items/1/properties/12/values/0')
    ).toMatchSnapshot();
  });
});

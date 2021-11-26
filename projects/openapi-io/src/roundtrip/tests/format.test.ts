import { formatJson } from '../helpers/format/format';

describe('format', () => {
  it('can format JSON', async () => {
    expect(
      formatJson(
        JSON.stringify({ hello: 'world', array: [1, 2, [[]]] }, null, 2),
        { spacer: 'tab', count: 1, shouldOverwrite: false }
      )
    ).toMatchSnapshot();
  });
});

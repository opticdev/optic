import { parseJsonComparisonInput } from '../bulk-compare';
import { loadFile } from '../../utils';

jest.mock('../../utils');
const mockedLoadFile = loadFile as jest.MockedFunction<typeof loadFile>;

describe('parseJsonComparisonInput', () => {
  test('parses a json file', async () => {
    mockedLoadFile.mockImplementation(async () => {
      return Buffer.from(
        JSON.stringify({
          comparisons: [
            {
              from: 'a',
              to: 'b',
              context: {
                abc: 123,
              },
            },
            {
              from: 'c',
              to: 'd',
              context: {
                cde: 'test',
              },
            },
            {
              from: 'e',
              to: 'f',
              context: {},
            },
          ],
        })
      );
    });
    const output = await parseJsonComparisonInput('abcdef');
    const expectedOutputs = [
      ['a', 'b', { abc: 123 }],
      ['c', 'd', { cde: 'test' }],
      ['e', 'f', {}],
    ];
    expect(output.size).toBe(3);
    [...output.values()].forEach((parsedLine, i) => {
      const [expectedFrom, expectedTo, context] = expectedOutputs[i];
      expect(parsedLine.fromFileName).toBe(expectedFrom);
      expect(parsedLine.toFileName).toBe(expectedTo);
      expect(parsedLine.context).toEqual(context);
    });
    mockedLoadFile.mockClear();
  });

  test("ignores rows that don't have the expected format", async () => {
    mockedLoadFile.mockImplementation(async () => {
      return Buffer.from(
        JSON.stringify({
          comparisons: [
            {
              from: 'a',
              to: 'b',
              context: {},
            },
            {
              from: 'c',
            },
            {
              to: 'f',
              context: {},
            },
          ],
        })
      );
    });
    const output = await parseJsonComparisonInput('abcdef');
    expect(output.size).toBe(1);
    output.forEach((line) => {
      expect(line.fromFileName).toBe('a');
      expect(line.toFileName).toBe('b');
    });
    mockedLoadFile.mockClear();
  });
});

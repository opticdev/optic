import { parseCsvComparisonInput } from '../bulk-compare';
import { loadFile } from '../../utils';

jest.mock('../../utils');
const mockedLoadFile = loadFile as jest.MockedFunction<typeof loadFile>;

describe('parseCsvComparisonInput', () => {
  test('parses a csv file', async () => {
    mockedLoadFile.mockImplementation(async () => {
      return Buffer.from(`
a,b
c,d
e,f
`);
    });
    const output = await parseCsvComparisonInput('abcdef');
    const expectedOutputs = [
      ['a', 'b'],
      ['c', 'd'],
      ['e', 'f'],
    ];
    expect(output.size).toBe(3);
    [...output.values()].forEach((parsedLine, i) => {
      const [expectedFrom, expectedTo] = expectedOutputs[i];
      expect(parsedLine.fromFileName).toBe(expectedFrom);
      expect(parsedLine.toFileName).toBe(expectedTo);
    });
    mockedLoadFile.mockClear();
  });

  test("ignores rows that don't have the expected format", async () => {
    mockedLoadFile.mockImplementation(async () => {
      return Buffer.from(`
a,b
c
e,f,2
`);
    });
    const output = await parseCsvComparisonInput('abcdef');
    expect(output.size).toBe(1);
    output.forEach((line) => {
      expect(line.fromFileName).toBe('a');
      expect(line.toFileName).toBe('b');
    });
    mockedLoadFile.mockClear();
  });
});

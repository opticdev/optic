import { jest, test, expect, describe } from '@jest/globals';
import { parseJsonComparisonInput } from '../input-generators';
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
    const { comparisons: output, skippedParsing } =
      await parseJsonComparisonInput('abcdef', () => ({}));
    const expectedOutputs = [
      ['a', 'b', { abc: 123 }],
      ['c', 'd', { cde: 'test' }],
      ['e', 'f', {}],
    ];
    expect(output.size).toBe(3);
    expect(skippedParsing).toBe(false);
    [...output.values()].forEach((parsedLine, i) => {
      const [expectedFrom, expectedTo, context] = expectedOutputs[i];
      expect(parsedLine.fromFileName).toBe(expectedFrom);
      expect(parsedLine.toFileName).toBe(expectedTo);
      expect(parsedLine.context).toEqual(context);
    });
    mockedLoadFile.mockClear();
  });

  test('handles when from is not specified', async () => {
    mockedLoadFile.mockImplementation(async () => {
      return Buffer.from(
        JSON.stringify({
          comparisons: [
            {
              to: 'b',
              context: {},
            },
          ],
        })
      );
    });
    const { comparisons: output, skippedParsing } =
      await parseJsonComparisonInput('abcdef', () => ({}));
    expect(output.size).toBe(1);
    expect(skippedParsing).toBe(false);
    output.forEach((line) => {
      expect(line.toFileName).toBe('b');
    });
    mockedLoadFile.mockClear();
  });

  test('handles when to is not specified', async () => {
    mockedLoadFile.mockImplementation(async () => {
      return Buffer.from(
        JSON.stringify({
          comparisons: [
            {
              from: 'b',
              context: {},
            },
          ],
        })
      );
    });
    const { comparisons: output, skippedParsing } =
      await parseJsonComparisonInput('abcdef', () => ({}));
    expect(output.size).toBe(1);
    expect(skippedParsing).toBe(false);
    output.forEach((line) => {
      expect(line.fromFileName).toBe('b');
    });
    mockedLoadFile.mockClear();
  });

  test('handles context when not supplied', async () => {
    mockedLoadFile.mockImplementation(async () => {
      return Buffer.from(
        JSON.stringify({
          comparisons: [
            {
              from: 'a',
              to: 'b',
            },
          ],
        })
      );
    });
    const { comparisons: output } = await parseJsonComparisonInput(
      'abcdef',
      () => ({ custom: '1' })
    );
    expect(output.size).toBe(1);
    output.forEach((line) => {
      expect(line.fromFileName).toBe('a');
      expect(line.toFileName).toBe('b');
      expect(line.context).toEqual({ custom: '1' });
    });
    mockedLoadFile.mockClear();
  });

  test('throws when from and to are not specified', async () => {
    mockedLoadFile.mockImplementation(async () => {
      return Buffer.from(
        JSON.stringify({
          comparisons: [
            {
              context: {},
            },
          ],
        })
      );
    });
    expect(parseJsonComparisonInput('abcdef', () => ({}))).rejects.toThrow();

    mockedLoadFile.mockClear();
  });
});

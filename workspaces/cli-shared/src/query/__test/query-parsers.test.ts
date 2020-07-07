import { DefaultQueryParser } from '../parsers/query-string/DefaultQueryParser';
import { CSVArrayParser } from '../parsers/values/CSV-Arrays';

describe('default query parser', () => {
  const parser = new DefaultQueryParser([]);

  test('simple query string', () => {
    const qs = '?foo=bar&bar=foobar';
    expect(parser.parseToKeysAndValues(qs)).toMatchSnapshot();
    expect(parser.parse(qs)).toMatchSnapshot();
  });

  test('same key, multiple times', () => {
    const qs = '?foo=1&foo=2&foo=3';
    expect(parser.parseToKeysAndValues(qs)).toMatchSnapshot();
    expect(parser.parse(qs)).toMatchSnapshot();
  });

  test('empty query string', () => {
    const qs = '';
    expect(parser.parseToKeysAndValues(qs)).toMatchSnapshot();
    expect(parser.parse(qs)).toMatchSnapshot();
  });
});

describe('csv arrays', () => {
  const parser = new CSVArrayParser({
    keys: ['colors'],
  });

  test('parses a csv string to an array', () => {
    expect(
      parser.shouldHandle('colors', ['red,green,yellow'])
    ).toMatchSnapshot();
    expect(parser.parse('colors', ['red,green,yellow'])).toMatchSnapshot();
  });

  test('other key will not be handled', () => {
    expect(parser.shouldHandle('shapes', ['square,circle'])).toMatchSnapshot();
  });

  test('array of one item is still parsed as csv array', () => {
    expect(parser.parse('colors', ['red'])).toMatchSnapshot();
  });
});

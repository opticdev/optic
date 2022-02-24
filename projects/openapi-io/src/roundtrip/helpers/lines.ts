import { JsonRoundtripConfig } from '../write-surgical/json';
import { YamlRoundTripConfig } from '../write-surgical/yaml';
const { EOL } = require('os');

export function lines(contents: string): string[] {
  return contents.split(/\r?\n/);
}

const startsWhiteSpaceRegex = /^(\s+)/;
export function startsWithWhitespace(line: string): false | string {
  const match = line.match(startsWhiteSpaceRegex);
  if (!match || !line) return false;
  return match[0];
}

export function replaceRange(
  contents: string,
  start: number,
  end: number,
  substitute: string
) {
  return contents.substring(0, start) + substitute + contents.substring(end);
}

export function insertLines(
  contents: string,
  afterLine: number,
  insert: string
): string {
  const asLines = lines(contents);

  asLines.splice(afterLine, 0, insert);

  return asLines.join(EOL);
}

export function removeLines(
  contents: string,
  lower: number,
  upper: number
): string {
  const asLines = lines(contents);
  return asLines
    .map((i, index) => {
      if (index >= lower && index <= upper) {
        return null;
      } else {
        return i;
      }
    })
    .filter((i) => i !== null)
    .join('\n');
}

export function pad(contents: string, padLeft: string = '') {
  const contentLines = lines(contents);

  let leadingStart: string | undefined = undefined;
  let leadingEnd: string | undefined = undefined;

  const f = {
    withLeading: (spacer: string) => {
      leadingStart = spacer;
      return f;
    },
    withTrailing: (spacer: string) => {
      leadingEnd = spacer;
      return f;
    },
    flush: () => {
      return contentLines
        .map((i, index) => {
          if (typeof leadingStart !== 'undefined' && index === 0) {
            return (
              (typeof leadingStart !== 'undefined' ? leadingStart : padLeft) + i
            );
          }

          if (
            typeof leadingEnd !== 'undefined' &&
            index === contentLines.length - 1 &&
            index > 0
          ) {
            return (
              (typeof leadingEnd !== 'undefined' ? leadingEnd : padLeft) + i
            );
          }

          return padLeft + i;
        })
        .join(EOL);
    },
  };
  return f;
}

export function jsonSpacer(jsonConfig: JsonRoundtripConfig): string {
  const char = jsonConfig.spacer === 'tab' ? '\t' : ' ';
  return char.padStart(jsonConfig.count + 1, char);
}

export function yamlSpacer(yamlConfig: YamlRoundTripConfig): string {
  return yamlConfig.count === 2 ? '  ' : '    ';
}

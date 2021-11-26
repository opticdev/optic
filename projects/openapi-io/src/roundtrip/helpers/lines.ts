import { JsonRoundtripConfig } from '../json';
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

export function spacer(jsonConfig: JsonRoundtripConfig): string {
  const char = jsonConfig.spacer === 'tab' ? '\t' : ' ';
  return new Array(jsonConfig.count + 1).join(char);
}

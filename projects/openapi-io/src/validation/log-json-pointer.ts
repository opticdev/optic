import chalk from 'chalk';
import { sourcemapReader } from '@useoptic/openapi-utilities';
import { JsonSchemaSourcemap } from '../parser/sourcemap';

type LogOptions = {
  highlightColor: 'red' | 'yellow' | 'green';
  observation: string;
};

export function jsonPointerLogger(sourceMap: JsonSchemaSourcemap) {
  const reader = sourcemapReader(sourceMap);

  return {
    log: (pointer: string, options?: LogOptions): string => {
      const lookupPosition = reader.findFileAndLines(pointer);
      if (lookupPosition) {
        const [start, end] = getDisplayedLineNumbers(lookupPosition.startLine);
        const source = sourceMap.files.find(
          (file) => file.path === lookupPosition.filePath
        );
        if (!source)
          throw new Error(
            'could not render issue for file ' + lookupPosition.filePath
          );

        const previewLines = source.contents.split('\n').slice(start, end);
        return renderCodeFrame(
          start,
          end,
          previewLines,
          lookupPosition.filePath,
          lookupPosition.startLine,
          options
        );
      }
      return '';
    },
  };
}

function getDisplayedLineNumbers(
  line: number,
  before: number = 4,
  after: number = 3
): [number, number] {
  const start = line - before >= 0 ? line - before : 0;
  const end = line + after;

  return [start, end];
}

function renderCodeFrame(
  start: number,
  end: number,
  lines: string[],
  fileName: string,
  focus?: number,
  options?: LogOptions
): string {
  const optionsOrDefault = options || {
    highlightColor: 'red',
    observation: '',
  };

  const maxLineWidth = end.toString().length + 1;

  const smallestLeadingWhiteSpace = Math.min(
    ...lines.map((lineContents) => lineContents.search(/\S|$/) || 0)
  );

  const formattedLines = lines.map((lineContents, index) => {
    const lineNumber = start + index;
    lineNumber.toString().padStart(maxLineWidth, ' ');

    const line = lineContents.substring(smallestLeadingWhiteSpace);

    const shouldHighlight =
      typeof focus === 'number' && focus - 1 === lineNumber;

    const observation = splitObservationLine(options?.observation || '');

    const lineWithObservation = observation
      ? `${line}  ${chalk.bgRed(observation)}`
      : line;

    return `${chalk.grey(lineNumber + 1 + ' |')} ${
      !shouldHighlight
        ? line
        : optionsOrDefault.highlightColor === 'red'
          ? chalk.bold.red(lineWithObservation)
          : optionsOrDefault.highlightColor === 'green'
            ? chalk.bold.green(lineWithObservation)
            : optionsOrDefault.highlightColor === 'yellow'
              ? chalk.bold.yellow(lineWithObservation)
              : line
    }`;
  });

  return `${formattedLines.join('\n')}\n${chalk.grey(fileName)}`;
}

function splitObservationLine(observation: string) {
  const lines = observation.split('\n');
  const firstLine = lines[0];

  if (firstLine.length > 40) {
    return firstLine.substring(0, 25) + '...';
  } else {
    return firstLine + (lines.length > 1 ? '...' : '');
  }
}

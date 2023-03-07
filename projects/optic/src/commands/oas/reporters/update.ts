import { WriteStream } from 'tty';
import readline from 'readline';
import invariant from 'ts-invariant';
import stripAnsi from 'strip-ansi';
import sliceAnsi from 'slice-ansi';
import Path from 'path';
import chalk from 'chalk';

type ObservedOperation = { pathPattern: string; method: string };

const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export async function updateReporter(stream: WriteStream, cwd: string) {
  let stats = {
    filesUpdated: Array.from<string>([]),
    interactionsCount: 0,
    matchedOperations: new Map<string, ObservedOperation>(),
    matchedInteractionsCount: 0,
    matchedInteractionCountByOperation: new Map<string, number>(),
    patchSourcesByOperation: new Map<string, Set<string>>(),
    patchCountByOperation: new Map<string, number>(),
    patchCountBySource: new Map<string, number>(),
  };

  const lines: {
    id: string;
    icon?: string;
    spinner: boolean;
    prefix?: string;
    text?: string;
  }[] = [];

  let spinnerFrame = 0;

  function renderLine(lineIndex: number) {
    const line = lines[lineIndex];
    if (!line) return;
    let renderedSpinner = line.spinner
      ? chalk.hex('#87afff')(spinner[spinnerFrame] + ' ')
      : '';
    let icon = line.icon ? line.icon + ' ' : '';

    let rendered = `${renderedSpinner}${icon}${line.prefix || ''}${
      line.text || ''
    }`;
    if (stripAnsi(rendered).length > stream.columns) {
      rendered = sliceAnsi(rendered, 0, stream.columns);
    }

    let lineNo = lines.length - lineIndex; //naive, breaks as soon as lines wrap
    // TODO: cap line width to available columns or implement wrapping
    writeOnLine(stream, lineNo, rendered);
  }

  function appendLine(line) {
    stream.write('\n');
    let len = lines.push(line);
    renderLine(len - 1);
  }

  function insertLine(line, lineIndex) {
    stream.write('\n');
    lines.splice(lineIndex, 0, line);
    for (let i = lineIndex; i < lines.length; i++) {
      // re-render all lines below
      renderLine(i);
    }
  }

  function animateSpinners() {
    spinnerFrame = ++spinnerFrame % spinner.length;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      if (!line.spinner) continue;
      renderLine(i);
    }
  }

  let animating = setInterval(animateSpinners, 80);

  function operationLineText(id) {
    if (!stats.matchedOperations.has(id)) return;

    let patchCount = stats.patchCountByOperation.get(id) || 0;
    let interactionCount =
      stats.matchedInteractionCountByOperation.get(id) || 0;

    return `${patchCount} ${chalk.dim(
      `patch${patchCount !== 1 ? 'es' : ''}`
    )} ${chalk.dim('/')} ${interactionCount} ${chalk.dim(
      `request${interactionCount !== 1 ? 's' : ''}`
    )}`;
  }

  function onTerminalResize() {
    for (let i = 0; i < lines.length; i++) {
      renderLine(i);
    }
  }

  stream.on('resize', onTerminalResize);

  appendLine({ id: 'footer-empty-line' });

  return {
    capturedInteraction({ path, method }: { path: string; method: string }) {
      stats.interactionsCount++;
    },
    matchedInteraction(op: ObservedOperation) {
      let id = operationId(op);

      if (!stats.matchedOperations.has(id)) {
        stats.matchedOperations.set(id, op);
        stats.matchedInteractionCountByOperation.set(id, 1);
        stats.patchCountByOperation.set(id, 0);
        let prefix = `${op.method.toUpperCase()} ${op.pathPattern} ${chalk.dim(
          '-'
        )} `;
        let text = operationLineText(id);
        let spinner = true;

        if (stats.matchedOperations.size === 1) {
          insertLine({ id: 'header-margin-top' }, 0);
        }

        insertLine({ id, prefix, text, spinner }, lines.length - 3); // add to the bottom
      } else {
        let interactionCount =
          stats.matchedInteractionCountByOperation.get(id)! + 1;
        stats.matchedInteractionCountByOperation.set(id, interactionCount);

        let opLineIndex = lines.findIndex(
          (line) => line.id === id && line.spinner
        );
        let line = lines[opLineIndex];
        invariant(
          line,
          'each operation should be represented by a rendered line'
        );

        line.text = operationLineText(id);
        renderLine(opLineIndex);
      }

      stats.matchedInteractionsCount++;
    },
    patch(op: ObservedOperation, capturedPath: string, description: string) {
      let id = operationId(op);
      let patchCount = (stats.patchCountByOperation.get(id) || 0) + 1;
      stats.patchCountByOperation.set(id, patchCount);

      let opLineIndex = lines.findIndex(
        (line) => line.id === id && line.spinner
      );
      if (opLineIndex <= -1) return;

      let line = lines[opLineIndex];
      line.text = operationLineText(id);
      renderLine(opLineIndex);

      if (!stats.patchSourcesByOperation.has(id)) {
        stats.patchSourcesByOperation.set(id, new Set());
      }
      let sources = stats.patchSourcesByOperation.get(id)!;
      let sourceId = `${id}-${capturedPath}`;
      if (!sources.has(sourceId)) {
        sources.add(sourceId);

        stats.patchCountBySource.set(sourceId, 1);

        insertLine(
          {
            id: sourceId,
            prefix: `${capturedPath} ${chalk.dim('-')} `,
            text: `1 ${chalk.dim('patch')}`,
            icon: chalk.dim('  │'),
            spinner: false,
          },
          opLineIndex + sources.size
        );
      } else {
        let sourcePatchCount = stats.patchCountBySource.get(sourceId)! + 1;

        stats.patchCountBySource.set(sourceId, sourcePatchCount);

        let sourcePatchLineIndex = lines.findIndex(
          (line) => line.id === sourceId
        );
        if (sourcePatchLineIndex) {
          let sourcePatchLine = lines[sourcePatchLineIndex];
          sourcePatchLine.text = `${sourcePatchCount} ${chalk.dim('patches')}`;

          renderLine(sourcePatchLineIndex);
        }
      }
    },
    fileUpdated(path: string) {
      stats.filesUpdated.push(path);
    },

    finish() {
      clearInterval(animating);

      for (let id of stats.matchedOperations.keys()) {
        let lineIndex = lines.findIndex(
          (line) => line.id === id && line.spinner
        );
        if (lineIndex <= -1) return;
        let line = lines[lineIndex];

        let patchCount = stats.patchCountByOperation.get(id) || 0;
        let text =
          patchCount <= 0
            ? chalk.dim(`traffic and spec match`)
            : `${patchCount} ${chalk.dim(
                `patch${patchCount > 1 ? 'es' : ''} applied`
              )}`;
        let icon =
          patchCount <= 0 ? chalk.greenBright(' ✓') : chalk.blueBright(' »');

        line.icon = icon;
        line.spinner = false;
        line.text = text;
        renderLine(lineIndex);
      }

      if (stats.filesUpdated.length > 0) {
        appendLine({ id: 'summary-margin' });
        for (let i = 0; i < stats.filesUpdated.length; i++) {
          let path = stats.filesUpdated[i];

          let relativePath = Path.relative(cwd, path);
          let isFarRemoved = relativePath
            .split(Path.sep)
            .slice(0, 4)
            .every((component) => component === '..');
        }
      }

      stream.removeListener('resize', onTerminalResize);
    },
  };
}

function operationId(operation: ObservedOperation) {
  return `${operation.method}-${operation.pathPattern}`;
}

function writeOnLine(stream: WriteStream, lineNo: number, content: string) {
  readline.cursorTo(stream, 0); // to start of current line
  readline.moveCursor(stream, 0, -lineNo); // start of subject line
  stream.write(content);
  readline.clearLine(stream, 1); // clear to the right of the cursor
  readline.cursorTo(stream, 0); // start of subject line
  readline.moveCursor(stream, 0, lineNo); // to start of original line
}

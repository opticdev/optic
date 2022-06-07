import { WriteStream } from 'tty';
import readline from 'readline';

type ObservedOperation = { pathPattern: string; method: string };

const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export async function updateReporter(stream: WriteStream) {
  const chalk = (await import('chalk')).default;
  let stats = {
    matchedOperations: new Map<string, ObservedOperation>(),
    patchCountByOperation: new Map<string, number>(),
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
    let lineNo = lines.length - lineIndex; // naive, breaks as soon as lines wrap
    writeOnLine(stream, lineNo, rendered);
  }

  function appendLine(line) {
    stream.write('\n');
    let len = lines.push(line);
    renderLine(len - 1);
  }

  function animateSpinners() {
    spinnerFrame = ++spinnerFrame % spinner.length;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      if (!line.spinner) return;
      renderLine(i);
    }
  }

  let animating = setInterval(animateSpinners, 80);

  return {
    add(op: ObservedOperation) {
      let id = operationId(op);
      if (stats.matchedOperations.has(id)) return;

      stats.matchedOperations.set(id, op);
      let prefix = `${op.method.toUpperCase()} ${op.pathPattern} - `;
      let text = `Matched first interaction`;
      let spinner = true;

      appendLine({ id, prefix, text, spinner });
    },
    patch(op: ObservedOperation, capturedPath: string, description: string) {
      let id = operationId(op);
      let patchCount = (stats.patchCountByOperation.get(id) || 0) + 1;
      let text = `${patchCount} patch${patchCount > 1 ? 'es' : ''} generated`;

      stats.patchCountByOperation.set(id, patchCount);

      let lineIndex = lines.findIndex((line) => line.id === id && line.spinner);
      if (lineIndex <= -1) return;

      let line = lines[lineIndex];
      line.text = text;
      renderLine(lineIndex);
    },
    succeed(op: ObservedOperation) {
      let id = operationId(op);
      let lineIndex = lines.findIndex((line) => line.id === id && line.spinner);
      if (lineIndex <= -1) return;
      let line = lines[lineIndex];

      let patchCount = stats.patchCountByOperation.get(id) || 0;
      let text =
        patchCount <= 0
          ? `no patches necessary`
          : `${patchCount} patch${patchCount > 1 ? 'es' : ''} applied`;
      let icon =
        patchCount <= 0 ? chalk.greenBright('✓') : chalk.blueBright('»');

      line.icon = icon;
      line.spinner = false;
      line.text = text;
      renderLine(lineIndex);
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
            ? `no patches necessary`
            : `${patchCount} patch${patchCount > 1 ? 'es' : ''} applied`;
        let icon =
          patchCount <= 0 ? chalk.greenBright('✓') : chalk.blueBright('»');

        line.icon = icon;
        line.spinner = false;
        line.text = text;
        renderLine(lineIndex);
      }

      if (stats.matchedOperations.size < 1) {
        console.log(`No matching operations found`);
      }
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

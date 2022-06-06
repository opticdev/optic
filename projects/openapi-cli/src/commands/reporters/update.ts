import { WriteStream } from 'tty';
import readline from 'readline';

type ObservedOperation = { pathPattern: string; method: string };

export function updateReporter(stream: WriteStream) {
  let stats = {
    matchedOperations: new Map<string, ObservedOperation>(),
    patchCountByOperation: new Map<string, number>(),
  };

  const lines: {
    id: string;
    spinner?: Spinner;
    prefix?: string;
    text?: string;
  }[] = [];

  // function cursorToLine(lineIndex: number) {
  //   let lineNo = lines.length - lineIndex - 1; // naive, breaks as soon as lines wrap
  //   readline.cursorTo(stream, 0, lineNo);
  // }

  function renderLine(lineIndex: number) {
    const line = lines[lineIndex];
    if (!line) return;
    let rendered = `${line.spinner?.frame() || ''} ${line.prefix || ''}${
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

  return {
    add(op: ObservedOperation) {
      let id = operationId(op);
      if (stats.matchedOperations.has(id)) return;

      stats.matchedOperations.set(id, op);
      let prefix = `${op.method.toUpperCase()} ${op.pathPattern} - `;
      let text = `Matched first interaction`;
      let spinner = new Spinner();

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
      let patchCount = stats.patchCountByOperation.get(id) || 0;
      let text =
        patchCount <= 0
          ? `no patches necessary`
          : `${patchCount} patch${patchCount > 1 ? 'es' : ''} applied`;

      let lineIndex = lines.findIndex((line) => line.id === id && line.spinner);
      if (lineIndex <= -1) return;

      let line = lines[lineIndex];
      line.text = text;
      renderLine(lineIndex);
    },

    finish() {},
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

class Spinner {
  current: number;
  chars: string[];

  constructor() {
    this.current = 0;
    this.chars = Spinner.spinners[0].split('');
  }

  static spinners: Array<string> = ['⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'];

  frame() {
    let char = this.chars[this.current];
    this.current = ++this.current % this.chars.length;
    return char;
  }
}

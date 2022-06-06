import { WriteStream } from 'tty';
import readline from 'readline';
import { Ora } from 'ora';

type ObservedOperation = { pathPattern: string; method: string };

export async function updateReporter(stream: WriteStream) {
  let ora = (await import('ora')) as any; // hack because ora has decided to go native ESM

  let stats = {
    matchedOperations: new Map<string, ObservedOperation>(),
    patchCountByOperation: new Map<string, number>(),
  };

  const lines: { id: string; spinner?: Ora; content?: string }[] = [];

  function cursorToLine(lineIndex: number) {
    let lineNo = lines.length - lineIndex - 1; // naive, breaks as soon as lines wrap
    readline.cursorTo(stream, 0, lineNo);
  }

  return {
    add(op: ObservedOperation) {
      let id = operationId(op);
      if (stats.matchedOperations.has(id)) return;

      stats.matchedOperations.set(id, op);
      let spinner = ora({
        prefixText: `${op.method.toUpperCase()} ${op.pathPattern} - `,
        text: `Matched first interaction`,
        hideCursor: false,
        stream,
      });

      lines.push({ id, spinner });
      cursorToLine(lines.length - 1);
      spinner.render();
    },
    patch(op: ObservedOperation, capturedPath: string, description: string) {
      let id = operationId(op);
      let patchCount = (stats.patchCountByOperation.get(id) || 0) + 1;
      let text = `${patchCount} patch${patchCount > 1 ? 'es' : ''} generated`;

      stats.patchCountByOperation.set(id, patchCount);

      let lineIndex = lines.findIndex((line) => line.id === id && line.spinner);
      if (lineIndex <= -1) return;

      let { spinner } = lines[lineIndex];
      spinner!.text = text;
      cursorToLine(lineIndex);
      spinner!.render();
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

      let { spinner } = lines[lineIndex];
      cursorToLine(lineIndex);
      spinner!.succeed(text);
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

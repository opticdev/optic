import prompts from 'prompts';
import { stdin as input, stdout as output } from 'node:process';
import chalk from 'chalk';
import { PathComponents } from '../operations';
import minimatch from 'minimatch';
const readline = require('readline');

/// Undocumented operation

// Actions
type DocumentNewOperation = {
  action: 'DocumentNewOperation';
  pattern: string;
  method: string;
};
type IgnorePattern = { action: 'IgnorePattern'; pattern: string };
type Skip = { action: 'Skip' };

// Form
export async function undocumentedOperation(
  pathPattern: string,
  inferredPath: string,
  method: string
): Promise<DocumentNewOperation | IgnorePattern | Skip> {
  function renderFrame1() {
    reset();
    console.log(chalk.bold(pathPattern));
    console.log(
      chalk.gray(
        `Press ${chalk.bold.blue('(a)')} to add, ${chalk.bold.blue(
          '(i)'
        )} to ignore, or ${chalk.bold.blue('(s)')} to skip: `
      )
    );
  }
  return new Promise(async (resolve, reject) => {
    renderFrame1();

    const choice = await getKey(['a', 's', 'i']);

    switch (choice) {
      case 'a':
        reset();
        const pattern = await pathPatternMatcher(
          pathPattern,
          inferredPath,
          'Enter path pattern'
        );
        if (pattern) {
          resolve({
            action: 'DocumentNewOperation',
            pattern: pattern,
            method,
          });
        } else {
          resolve({ action: 'Skip' });
        }
        break;
      case 'i':
        const ignorePattern = await ignorePatternBuilder(pathPattern);
        if (ignorePattern)
          resolve({ action: 'IgnorePattern', pattern: ignorePattern });
        break;
      case 's':
        resolve({ action: 'Skip' });
        break;
    }
  });
}

export async function pathPatternMatcher(
  pathPattern: string,
  inferredPath: string,
  message: string = 'Enter path pattern'
): Promise<string | null> {
  let path = inferredPath;
  function tryValidate(path: string): 'match' | 'partial' | 'no-match' {
    try {
      const compPath = PathComponents.fromPath(path);
      const realComponents = pathPattern.split('/').slice(1);

      const compResults = realComponents.map((comp, index) => {
        const pathComponent = compPath[index];

        if (pathComponent) {
          if (pathComponent.kind === 'literal') {
            return pathComponent.name === comp;
          } else if (pathComponent.kind === 'template' && compPath) {
            return true;
          }
        } else {
          return false;
        }
      });

      return compResults.every((i) => i)
        ? 'match'
        : compResults.indexOf(false) > 0
        ? 'partial'
        : 'no-match';
    } catch (e) {
      return 'no-match';
    }
  }
  function render() {
    reset();

    const validation = tryValidate(path);
    const spacer = ''.padStart(message.length + 5, ' ');
    if (validation === 'match')
      console.log(`${spacer}${chalk.green(pathPattern)}`);
    if (validation === 'partial')
      console.log(`${spacer}${chalk.yellow(pathPattern)}`);
    if (validation === 'no-match')
      console.log(`${spacer}${chalk.red(pathPattern)}`);
  }

  render();

  return new Promise(async (resolve) => {
    await prompts(
      {
        type: 'text',
        name: 'value',
        initial: path,
        message,
        validate: ({ value }) => {
          return tryValidate(path) === 'match'
            ? true
            : 'This path pattern does not match the against the real path';
        },
        onState: ({ value }) => {
          path = value;
          render();
        },
      },
      {
        onCancel: () => {
          resolve(null);
        },
        onSubmit: (_, answer) => {
          resolve(answer);
        },
      }
    );
  });
}

export async function ignorePatternBuilder(
  actualPath: string
): Promise<string | null> {
  let ignorePath = '';
  function tryValidate(path: string): 'match' | 'no-match' {
    try {
      return minimatch(actualPath, path) ? 'match' : 'no-match';
    } catch (e) {
      return 'no-match';
    }
  }

  const message = 'Ignore pattern (globs patterns i.e. **/*.png supported)';
  function render() {
    reset();

    const validation = tryValidate(ignorePath);
    const spacer = ''.padStart(message.length + 5, ' ');
    if (validation === 'match')
      console.log(`${spacer}${chalk.green(actualPath)}`);

    if (validation === 'no-match')
      console.log(`${spacer}${chalk.red(actualPath)}`);
  }

  render();

  return new Promise(async (resolve) => {
    await prompts(
      {
        type: 'text',
        name: 'value',
        message,
        validate: ({ value }) => {
          return tryValidate(ignorePath) === 'match'
            ? true
            : 'This ignore glob does not match the path you want to ignore';
        },
        onState: ({ value }) => {
          ignorePath = value;
          render();
        },
      },
      {
        onCancel: () => {
          resolve(null);
        },
        onSubmit: (_, answer) => {
          resolve(answer);
        },
      }
    );
  });
}

/// helpers
function reset(isSoft: boolean = true) {
  process.stdout.write(isSoft ? '\x1B[H\x1B[2J' : '\x1B[2J\x1B[3J\x1B[H\x1Bc');
}

export function setupInteractiveMode() {
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.on('keypress', handleControlC);
}

function handleControlC(str: boolean, key: any) {
  if (key.ctrl && key.name === 'c') {
    process.exit();
  }
}
export function cleanupInteractiveMode() {
  process.stdin.off('keypress', handleControlC);
}

async function getKey(validate: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const handler = (str, key) => {
      if (key.ctrl && key.name === 'c') {
        process.exit();
      } else {
        if (validate.includes(key.name)) {
          process.stdin.off('keypress', handler);
          resolve(key.name);
        }
      }
    };

    process.stdin.on('keypress', handler);
  });
}

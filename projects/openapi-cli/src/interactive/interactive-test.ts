import {
  cleanupInteractiveMode,
  pathPatternMatcher,
  setupInteractiveMode,
  undocumentedOperation,
} from './interactive-prompts';

async function main() {
  setupInteractiveMode();
  switch (process.argv[2]) {
    case 'match-url':
      console.log(await pathPatternMatcher('/todos/1235', '/todos/{todoId}'));
      break;

    case 'undocumented':
      console.log(
        await undocumentedOperation('/todos/1235', '/todos/{todoId}', 'get')
      );
      break;
    default: {
      process.exit(1);
    }
  }

  cleanupInteractiveMode();
  process.exit(1);
}

export {};

main();

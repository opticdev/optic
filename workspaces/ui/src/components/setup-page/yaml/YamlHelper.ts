import { load } from 'yaml-ast-parser';
import niceTry from 'nice-try';
interface KeyValues {
  value: string;
  startPosition: number;
  endPosition: number;
  startLine: number;
  endLine: number;
}

export interface RangesFromYaml {
  isValid: boolean;
  task?: {
    name: string;
    command: KeyValues | undefined;
    inboundUrl: KeyValues | undefined;
    targetUrl: KeyValues | undefined;
    useTask: KeyValues | undefined;
  };
  taskRange?: {
    startPosition: number;
    endPosition: number;
  };
}

export function rangesFromOpticYaml(
  yamlString: string,
  task: string
): RangesFromYaml {
  const result = load(yamlString);

  debugger;
  const allTasks = result.mappings.find((i) => i.key.value === 'tasks');

  function stringValueOf(node, key): KeyValues | undefined {
    const scalar =
      node &&
      node.value &&
      node.value.mappings &&
      node.value.mappings.find((i) => i.key.value === key);
    if (scalar && scalar.value) {
      return {
        value: scalar.value.value,
        startPosition: scalar.value.startPosition,
        endPosition: scalar.value.endPosition,
        ...computeLines(
          yamlString,
          scalar.value.startPosition,
          scalar.value.endPosition
        ),
      };
    } else {
      return undefined;
    }
  }

  if (allTasks && allTasks.value && allTasks.value.mappings) {
    const thisTask = allTasks.value.mappings.find((i) => i.key.value === task);
    if (thisTask) {
      return {
        isValid: result.errors.length === 0,
        task: {
          name: task,
          command: niceTry(() => stringValueOf(thisTask, 'command')),
          inboundUrl: niceTry(() => stringValueOf(thisTask, 'inboundUrl')),
          targetUrl: niceTry(() => stringValueOf(thisTask, 'targetUrl')),
          useTask: niceTry(() => stringValueOf(thisTask, 'useTask')),
        },
        taskRange: {
          startPosition: thisTask.startPosition,
          endPosition: thisTask.endPosition,
        },
      };
    }
  }

  return {
    isValid: result.errors.length === 0,
  };
}

function computeLines(
  contents: string,
  startPosition: number,
  endPosition: number
): { endLine: number; startLine: number } {
  const startLine = splitLines(contents.substr(0, startPosition)).length - 1;
  const endLine = splitLines(contents.substr(0, endPosition)).length - 1;

  return {
    startLine,
    endLine,
  };
}

function splitLines(t): string[] {
  return t.split(/\r\n|\r|\n/);
}

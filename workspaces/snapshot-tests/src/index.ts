import * as path from 'path';
import * as fs from 'fs-extra';
import { TypedEventEmitter } from './typed-event-emitter';
import {
  executors,
  ITaskContext,
  ITaskIdentifier,
  ITaskSpecification,
  TaskIdentifier,
  TaskType,
} from './tasks';
import {
  EventsToRfcStateTaskOutput,
  EventsToRfcStateTaskSpecification,
} from './tasks/EventsToRfcState';
import {
  EventsFileToJsTaskOutput,
  EventsFileToJsTaskSpecification,
} from './tasks/EventsFileToJsTaskSpecification';
import {
  InteractionsFileToJsTaskOutput,
  InteractionsFileToJsTaskSpecification,
} from './tasks/InteractionsFileToJs';
import {
  RfcStateAndInteractionsToDiffsTaskOutput,
  RfcStateAndInteractionsToDiffsTaskSpecification,
} from './tasks/RfcStateAndInteractionsToDiffs';
import DataLoader = require('dataloader');

async function* FileSystemInputIterator(
  inputDirectory: string
): AsyncGenerator<ITaskContext> {
  const inputUniverses = await fs.readdir(path.join(inputDirectory, 'events'));
  for (const universe of inputUniverses) {
    console.log({ universe });
    const eventScenarios = await fs.readdir(
      path.join(inputDirectory, 'events', universe)
    );
    console.log({ universe, eventScenarios });

    const interactionsScenarios = await fs.readdir(
      path.join(inputDirectory, 'interactions', universe)
    );
    console.log({ universe, interactionsScenarios });

    for (const eventsScenario of eventScenarios) {
      for (const interactionsScenario of interactionsScenarios) {
        console.log(`emitting next input scenario`);
        const scenario = {
          universe,
          eventsScenario,
          interactionsScenario,
        };
        console.log({ scenario });
        yield scenario;
      }
    }
  }
}

import * as crypto from 'crypto';
import { opticEngine } from '@useoptic/domain';

function getOutputFilePrefix(id: TaskIdentifier) {
  const hash = crypto.createHash('sha256');
  hash.update(id);
  return hash.digest('hex');
}

function WrapError(e: Error) {
  return {
    type: 'error',
    value: e.message,
  };
}

function WrapSuccess(result: any) {
  return {
    type: 'success',
    value: result,
  };
}

//@CONTRIBUTORS: this is where we build the dependency graph of tasks
function TaskSpecificationsForContext(
  context: ITaskContext
): ITaskSpecification[] {
  const eventsFileToJs: EventsFileToJsTaskSpecification = {
    type: TaskType.EventsFileToJsTaskSpecification,
    context,
    inputs: {},
  };
  const eventsToRfcState: EventsToRfcStateTaskSpecification = {
    type: TaskType.EventsToRfcStateTaskSpecification,
    context,
    inputs: {
      eventsFromFile: eventsFileToJs,
    },
  };
  const interactionsFileToJs: InteractionsFileToJsTaskSpecification = {
    type: TaskType.InteractionsFileToJsTaskSpecification,
    context,
    inputs: {},
  };
  const rfcStateAndInteractionsToDiffs: RfcStateAndInteractionsToDiffsTaskSpecification = {
    type: TaskType.RfcStateAndInteractionsToDiffs,
    context,
    inputs: {
      interactionsFromFile: interactionsFileToJs,
      rfcStateFromEvents: eventsToRfcState,
    },
  };
  return [
    eventsFileToJs,
    interactionsFileToJs,
    eventsToRfcState,
    rfcStateAndInteractionsToDiffs,
  ];
}

////////////////////////////////////////////////////////////////////////////////
//@CONTRIBUTORS register output serializers here
const outputSerializers: {
  [TaskType.EventsToRfcStateTaskSpecification]: (
    output: EventsToRfcStateTaskOutput
  ) => string;
  [TaskType.InteractionsFileToJsTaskSpecification]: (
    output: InteractionsFileToJsTaskOutput
  ) => string;
  [TaskType.EventsFileToJsTaskSpecification]: (
    output: EventsFileToJsTaskOutput
  ) => string;
  [TaskType.RfcStateAndInteractionsToDiffs]: (
    output: RfcStateAndInteractionsToDiffsTaskOutput
  ) => string;
} = {
  [TaskType.EventsFileToJsTaskSpecification](output) {
    return JSON.stringify(output.events, null, 2);
  },
  [TaskType.EventsToRfcStateTaskSpecification](output) {
    return output.rfcState.toString();
  },
  [TaskType.InteractionsFileToJsTaskSpecification](output) {
    return JSON.stringify(output.interactions, null, 2);
  },
  [TaskType.RfcStateAndInteractionsToDiffs](output) {
    return JSON.stringify(
      opticEngine.DiffJsonSerializer.toJs(output.diffs),
      null,
      2
    );
  },
};
////////////////////////////////////////////////////////////////////////////////

const outputBaseDirectory = 'outputs';

async function serializeFailure(
  id: string,
  taskSpecification: ITaskSpecification,
  e: Error
) {
  const groupDirectory = getOutputFilePrefix(
    JSON.stringify(taskSpecification.context)
  );
  const taskDirectory = getOutputFilePrefix(id);
  const outputPath = path.join(
    outputBaseDirectory,
    groupDirectory,
    taskDirectory
  );
  await fs.ensureDir(outputPath);
  await fs.writeJson(
    path.join(
      outputBaseDirectory,
      groupDirectory,
      taskDirectory,
      'specification.json'
    ),
    taskSpecification,
    { spaces: 2 }
  );
  await fs.writeFile(
    path.join(
      outputBaseDirectory,
      groupDirectory,
      taskDirectory,
      'output.error.json'
    ),
    JSON.stringify(WrapError(e))
  );
}

async function serializeResult(
  id: string,
  taskSpecification: ITaskSpecification,
  result: any
) {
  const groupDirectory = getOutputFilePrefix(
    JSON.stringify(taskSpecification.context)
  );
  const taskDirectory = getOutputFilePrefix(id);
  const outputPath = path.join(
    outputBaseDirectory,
    groupDirectory,
    taskDirectory
  );
  await fs.ensureDir(outputPath);
  await fs.writeJson(
    path.join(
      outputBaseDirectory,
      groupDirectory,
      taskDirectory,
      'specification.json'
    ),
    taskSpecification,
    { spaces: 2 }
  );
  await fs.writeFile(
    path.join(
      outputBaseDirectory,
      groupDirectory,
      taskDirectory,
      'output.snapshot.txt'
    ),
    outputSerializers[taskSpecification.type](result)
  );
}

////////////////////////////////////////////////////////////////////////////////
async function main() {
  const taskSpecificationToTaskId: ITaskIdentifier = function (
    taskSpecification: ITaskSpecification
  ): string {
    return JSON.stringify(taskSpecification);
  };

  const inputQueue = new TypedEventEmitter<{
    added: { taskSpecification: ITaskSpecification };
  }>();

  const outputQueues: {
    [key in TaskType]: TypedEventEmitter<{ [key: string]: any }>;
  } = {
    [TaskType.EventsToRfcStateTaskSpecification]: new TypedEventEmitter<{
      [key: string]: EventsToRfcStateTaskOutput;
    }>(),
    [TaskType.InteractionsFileToJsTaskSpecification]: new TypedEventEmitter<{
      [key: string]: InteractionsFileToJsTaskOutput;
    }>(),
    [TaskType.EventsFileToJsTaskSpecification]: new TypedEventEmitter<{
      [key: string]: EventsFileToJsTaskOutput;
    }>(),
    [TaskType.RfcStateAndInteractionsToDiffs]: new TypedEventEmitter<{
      [key: string]: RfcStateAndInteractionsToDiffsTaskOutput;
    }>(),
  };

  inputQueue.on('added', async ({ taskSpecification }) => {
    console.log('input added');
    console.log({ taskSpecification });
    const id = taskSpecificationToTaskId(taskSpecification);
    const outputQueue = outputQueues[taskSpecification.type];
    try {
      const dependencyEntries = Object.entries(taskSpecification.inputs).map(
        (entry) => {
          const [key, value] = entry;
          return {
            key,
            value,
          };
        }
      );
      console.log(`waiting for dependencies ${id}`);
      console.log(dependencyEntries);
      const dependenciesArray = await results.loadMany(
        dependencyEntries.map((x) => x.value)
      );
      console.log(`done waiting for dependencies ${id}`);

      const dependencies = dependenciesArray.reduce((acc, item, index) => {
        const key = dependencyEntries[index].key;
        acc[key] = item;
        return acc;
      }, {});
      console.log({ dependencies });

      const executor = executors[taskSpecification.type];
      console.log('executor starting');
      //@ts-ignore
      const result = await executor(taskSpecification, dependencies);
      console.log('executor finished');
      console.log({ result });
      outputQueue.emit(id, result);
      serializeResult(id, taskSpecification, result);
    } catch (e) {
      console.log('executor failed');
      console.error(e);
      debugger;
      outputQueue.emit(id, e);
      serializeFailure(id, taskSpecification, e);
    }
  });
  const results: DataLoader<ITaskSpecification, any> = new DataLoader<
    ITaskSpecification,
    any,
    string
  >(
    (batch) => {
      console.log({ batch });
      const promises = batch.map((x) => {
        return new Promise<any>((resolve, reject) => {
          const outputQueue = outputQueues[x.type];
          const id = taskSpecificationToTaskId(x);
          console.log(`listening for ${id}`);
          outputQueue.once(id, (result: any) => {
            console.log(`done listening for ${id}`);
            console.log({ id, result });
            resolve(result);
          });
        });
      });
      return Promise.all(promises);
    },
    {
      cacheKeyFn: taskSpecificationToTaskId,
      maxBatchSize: 1,
    }
  );
  const inputIterator = FileSystemInputIterator('./inputs');
  for await (const input of inputIterator) {
    const tasks = TaskSpecificationsForContext(input);
    tasks.forEach((taskSpecification) => {
      inputQueue.emit('added', { taskSpecification });
    });
  }
}

main();

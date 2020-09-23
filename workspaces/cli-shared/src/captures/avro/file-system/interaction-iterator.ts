import path from 'path';
import fs from 'fs-extra';
import { IHttpInteraction, IInteractionBatch } from '@useoptic/domain-types';
import { IFileSystemCaptureLoaderConfig } from './capture-loader';
import { captureFileSuffix } from './index';
import avro from 'avsc';
import { CaptureId } from '@useoptic/saas-types';

export interface FilterPredicate<T> {
  (item: T): boolean;
}
export type InteractionIteratorItem =
  | {
      hasMoreInteractions: false;
      interaction: null;
      skippedInteractionsCounter: bigint;
      diffedInteractionsCounter: bigint;
    }
  | {
      hasMoreInteractions: true;
      interaction: {
        context: {
          batchId: string;
          index: number;
        };
        value: IHttpInteraction;
      } | null;
      skippedInteractionsCounter: bigint;
      diffedInteractionsCounter: bigint;
    };
export async function* CaptureInteractionIterator(
  config: IFileSystemCaptureLoaderConfig,
  filter: FilterPredicate<IHttpInteraction>
  //@TODO: add a way to check if the capture has completed
): AsyncGenerator<InteractionIteratorItem> {
  let shouldStop = false;
  let skippedInteractionsCounter = BigInt(0);
  let diffedInteractionsCounter = BigInt(0);
  let currentBatchId = BigInt(0);
  while (!shouldStop) {
    const batchFilePath = path.join(
      config.captureBaseDirectory,
      config.captureId,
      `${currentBatchId.toString()}${captureFileSuffix}`
    );
    if (!(await fs.pathExists(batchFilePath))) {
      //@TODO: determine if we should wait
      return;
    }
    console.log(batchFilePath + '\n\nxxx\n\n');
    let index = 0;
    const items = BatchInteractionIterator(batchFilePath);
    for await (const x of items) {
      const shouldEmit = filter(x);
      if (shouldEmit) {
        diffedInteractionsCounter = diffedInteractionsCounter + BigInt(1);
        yield {
          hasMoreInteractions: true,
          interaction: {
            context: {
              batchId: currentBatchId.toString(),
              index,
            },
            value: x,
          },
          skippedInteractionsCounter,
          diffedInteractionsCounter,
        };
      } else {
        skippedInteractionsCounter = skippedInteractionsCounter + BigInt(1);
        yield {
          hasMoreInteractions: true,
          interaction: null,
          skippedInteractionsCounter,
          diffedInteractionsCounter,
        };
        console.log(`skipping ${x.request.method} ${x.request.path}`);
      }
      index = index + 1;
    }
    currentBatchId = currentBatchId + BigInt(1);
  }

  yield {
    hasMoreInteractions: false,
    interaction: null,
    skippedInteractionsCounter,
    diffedInteractionsCounter,
  };
}

export async function* BatchInteractionIterator(batchFilePath: string) {
  const contents = await loadBatchFile(batchFilePath);
  for (const item of contents.batchItems) {
    yield item;
  }
}

export async function loadBatchFile(batchFilePath: string) {
  console.time(`loadBatchFile-${batchFilePath}`);
  const decoder = avro.createFileDecoder(batchFilePath);
  const contents = await new Promise<IInteractionBatch>((resolve, reject) => {
    decoder.once('data', (contents: IInteractionBatch) => {
      resolve(contents);
    });
    decoder.once('error', (err) => reject(err));
  });
  console.timeEnd(`loadBatchFile-${batchFilePath}`);
  return contents;
}

export type InteractionPointer = string;

export interface IInteractionPointerConverter<C> {
  toPointer(interaction: IHttpInteraction, context: C): InteractionPointer;

  fromPointer(pointer: InteractionPointer): Promise<IHttpInteraction>;
}

export interface LocalCaptureInteractionContext {
  batchId: string;
  interactionIndex: number;
}

export class LocalCaptureInteractionPointerConverter
  implements IInteractionPointerConverter<LocalCaptureInteractionContext> {
  constructor(
    private config: {
      captureId: CaptureId;
      captureBaseDirectory: string;
    }
  ) {}

  async fromPointer(pointer: InteractionPointer): Promise<IHttpInteraction> {
    const [batchId, interactionIndexString] = pointer.split('-');
    const interactionIndex = parseInt(interactionIndexString, 10);
    const batchFilePath = path.join(
      this.config.captureBaseDirectory,
      this.config.captureId,
      `${batchId}${captureFileSuffix}`
    );
    const contents = await loadBatchFile(batchFilePath);
    return contents.batchItems[interactionIndex];
  }

  toPointer(
    interaction: IHttpInteraction,
    context: LocalCaptureInteractionContext
  ): InteractionPointer {
    return `${context.batchId}-${context.interactionIndex}`;
  }
}

import path from 'path';
import fs from 'fs-extra';
import { IHttpInteraction } from '@useoptic/domain-types';
import { IFileSystemCaptureLoaderConfig } from './capture-loader';
import { captureFileSuffix } from './index';
import avro from 'avsc';
import { CaptureId } from '@useoptic/saas-types';
import {
  serdesWithBodies,
  serdesWithoutBodies,
} from './avro-schemas/interaction-batch-helpers';

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
    // console.log(batchFilePath + '\n\nxxx\n\n');
    let index = 0;
    const { items, skippedItemsCount } = await loadBatchFileWithFilter(
      batchFilePath,
      filter
    );
    skippedInteractionsCounter =
      skippedInteractionsCounter + BigInt(skippedItemsCount);
    for (const item of items) {
      diffedInteractionsCounter = diffedInteractionsCounter + BigInt(1);
      yield {
        hasMoreInteractions: true,
        interaction: {
          context: {
            batchId: currentBatchId.toString(),
            index,
          },
          value: item,
        },
        skippedInteractionsCounter,
        diffedInteractionsCounter,
      };
      index = index + 1;
    }
    const isBatchEmpty = index === 0;
    if (isBatchEmpty) {
      yield {
        hasMoreInteractions: true,
        interaction: null,
        skippedInteractionsCounter,
        diffedInteractionsCounter,
      };
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
  const items = await loadBatchFile(batchFilePath);
  for (const item of items) {
    yield item;
  }
}

export async function loadBatchFile(batchFilePath: string) {
  // console.time(`loadBatchFile-${batchFilePath}`);
  const decoder = avro.createFileDecoder(batchFilePath);
  const contents = await new Promise<IHttpInteraction[]>((resolve, reject) => {
    const items: IHttpInteraction[] = [];
    decoder.on('data', (item: IHttpInteraction) => {
      items.push(item);
    });
    decoder.once('error', (err) => reject(err));
    decoder.once('end', () => {
      resolve(items);
    });
  });
  // console.timeEnd(`loadBatchFile-${batchFilePath}`);
  return contents;
}

export interface BatchContainer {
  items: IHttpInteraction[];
  skippedItemsCount: number;
}

export async function loadBatchFileWithFilter(
  batchFilePath: string,
  filter: FilterPredicate<IHttpInteraction>
) {
  // console.time(`${prefix}-loadBatchFileWithFilter-${batchFilePath}`);
  const contents = await new Promise<BatchContainer>(
    async (resolve, reject) => {
      const result: BatchContainer = {
        items: [],
        skippedItemsCount: 0,
      };
      // console.time(`${prefix}-lbitem-buffer`);
      const decoder = avro.createFileDecoder(batchFilePath, {
        noDecode: true,
      });
      let x = 0;
      decoder.on('data', (buffer: Buffer) => {
        if (x === 0) {
          // console.timeEnd(`${prefix}-lbitem-buffer`);
        }
        // console.time(`${prefix}-lbitem-${x}`);
        const resolver = serdesWithoutBodies.createResolver(serdesWithBodies);
        const offset = 0;
        const itemWithoutBodies = serdesWithoutBodies.decode(
          buffer,
          offset,
          resolver
        );
        if (!itemWithoutBodies.value) {
          throw new Error(
            `expected avro bytes to deserialize as IHttpInteraction`
          );
        }

        const shouldEmit = filter(itemWithoutBodies.value);

        if (shouldEmit) {
          const itemWithBodies = serdesWithBodies.decode(buffer, offset);
          if (!itemWithBodies.value) {
            throw new Error(
              `expected avro bytes to deserialize as IHttpInteraction`
            );
          }
          for (let i = 0; i < parseInt(process.env.TRAFFIC_M || '1'); i++) {
            result.items.push(itemWithBodies.value);
          }
        } else {
          result.skippedItemsCount = result.skippedItemsCount + 1;
        }
        // console.timeEnd(`${prefix}-lbitem-${x}`);
        x++;
      });
      decoder.once('error', (err) => {
        reject(err);
      });
      decoder.once('end', () => {
        resolve(result);
      });
    }
  );
  // console.timeEnd(`${prefix}-loadBatchFileWithFilter-${batchFilePath}`);
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
    return contents[interactionIndex];
  }

  toPointer(
    interaction: IHttpInteraction,
    context: LocalCaptureInteractionContext
  ): InteractionPointer {
    return `${context.batchId}-${context.interactionIndex}`;
  }
}

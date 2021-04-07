// import * as DiffEngine from '@useoptic/diff-engine-wasm/engine/browser';
// // @ts-ignore
// import uuid from 'uuid';
// import { AsyncTools, Streams } from '@useoptic/diff-engine-wasm';
// import {
//   IOpticCaptureService,
//   IOpticDiffService,
//   IStartDiffResponse,
// } from '@useoptic/spectacle/src';
//
// export class ExampleDiff {a
//   private diffId?: any;
//   private diffing?: Promise<any[]>;
//
//   start(events: any[], interactions: any[]) {
//     const spec = DiffEngine.spec_from_events(JSON.stringify(events));
//     this.diffId = uuid.uuidv4();
//
//     const diffingStream = (async function* (): AsyncIterable<Streams.DiffResults.DiffResult> {
//       for (let interaction of interactions) {
//         let results = DiffEngine.diff_interaction(
//           JSON.stringify(interaction),
//           spec
//         );
//
//         let parsedResults = JSON.parse(results);
//         let taggedResults = (parsedResults = parsedResults.map(
//           ([diffResult, fingerprint]: any) => [
//             diffResult,
//             [interaction.uuid],
//             fingerprint,
//           ]
//         ));
//
//         for (let result of taggedResults) {
//           yield result;
//         }
//         // make sure this is async so we don't block the UI thread
//         await new Promise((resolve) => setTimeout(resolve));
//       }
//     })();
//
//     // Consume stream instantly for now, resulting in a Promise that resolves once exhausted
//     this.diffing = AsyncTools.toArray(diffingStream);
//
//     return this.diffId;
//   }
//
//   async getNormalizedDiffs() {
//     // Q: Why not consume diff stream straight up? A: we don't have a way to fork streams yet
//     // allowing only a single consumer, and we need multiple (results themselves + urls)!
//     const diffResults = AsyncTools.from(await this.diffing);
//
//     const normalizedDiffs = Streams.DiffResults.normalize(diffResults);
//     const lastUniqueResults = Streams.DiffResults.lastUnique(normalizedDiffs);
//
//     return AsyncTools.toArray(lastUniqueResults);
//   }
//
//   async getUnrecognizedUrls() {
//     // Q: Why not consume diff stream straight up? A: we don't have a way to fork streams yet
//     // allowing only a single consumer, and we need multiple (results themselves + urls)!
//     const diffResults = AsyncTools.from(await this.diffing);
//
//     const undocumentedUrls = Streams.UndocumentedUrls.fromDiffResults(
//       diffResults
//     );
//     const lastUnique = Streams.UndocumentedUrls.lastUnique(undocumentedUrls);
//
//     return AsyncTools.toArray(lastUnique);
//   }
// }
//
// export class ExampleCaptureService implements IOpticCaptureService {
//   constructor(private exampleDiff: ExampleDiff, private samples: any[]) {}
//
//   async startDiff(
//     events: any[],
//     ignoreRequests: string[]
//   ): Promise<IStartDiffResponse> {
//     // const captureId = 'example-capture';
//     const diffId = await this.exampleDiff.start(events, this.samples);
//     return {
//       diffId,
//       notificationsUrl: '',
//     };
//   }
//
//   async loadInteraction(interactionPointer: string): Promise<any> {
//     const interaction = this.samples.find(
//       (x: any) => x.uuid === interactionPointer
//     );
//     return {
//       interaction,
//     };
//   }
//
//   baseUrl = '';
// }
//
// export class ExampleDiffService implements IOpticDiffService {
//   constructor(
//     private exampleDiff: ExampleDiff,
//     private captureService: IOpticCaptureService,
//     private diffConfig: IStartDiffResponse,
//     private diffs: any
//   ) {}
//
//   diffId(): string {
//     return this.diffConfig.diffId;
//   }
//
//   async listDiffs(): Promise<any> {
//     const diffs = (await this.exampleDiff.getNormalizedDiffs()).map(
//       ([diff, tags]: any) => {
//         return [diff, tags];
//       }
//     );
//     return Promise.resolve({ diffs });
//   }
//
//   async listUnrecognizedUrls(): Promise<any> {
//     const urls = (await this.exampleDiff.getUnrecognizedUrls()).map(
//       ({ fingerprint, ...rest }: any) => {
//         return rest;
//       }
//     );
//
//     return Promise.resolve({ urls });
//   }
//
//   learnInitial(events: any[], pathId: string, method: string): Promise<any> {
//     return Promise.resolve(undefined);
//   }
//
//   //
//   // async learnInitial(
//   //   rfcId: any,
//   //   pathId: string,
//   //   method: string,
//   //   opticIds: any = undefined
//   // ): Promise<ILearnedBodies> {
//   //   const capture = await this.specService.listCapturedSamples(captureId);
//   //   const interactions = capture.samples;
//   //
//   //   const rfcState = rfcService.currentState(rfcId);
//   //
//   //   return localInitialBodyLearner(
//   //     rfcState,
//   //     pathId,
//   //     method,
//   //     interactions,
//   //     opticIds
//   //   );
//   // }
//   //
//   // async learnTrailValues(
//   //   rfcService: any,
//   //   rfcId: any,
//   //   pathId: string,
//   //   method: string,
//   //   diffs: { [key: string]: IDiff }
//   // ): Promise<IValueAffordanceSerializationWithCounterGroupedByDiffHash> {
//   //   const capture = await this.specService.listCapturedSamples(captureId);
//   //   const interactions = capture.samples;
//   //
//   //   const rfcState = rfcService.currentState(rfcId);
//   //
//   //   return localTrailValuesLearner(
//   //     rfcState,
//   //     pathId,
//   //     method,
//   //     diffs,
//   //     interactions
//   //   );
//   // }
// }

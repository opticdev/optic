import { batchCommandHandler } from '../../../utilities/BatchCommandHandler';
import { useEffect, useState } from 'react';
import {
  getOrUndefined,
  opticEngine,
  OpticIds,
  RequestsCommands,
} from '@useoptic/domain';
import { DiffResultHelper } from '@useoptic/domain';
import Bottleneck from 'bottleneck';
import flattenDeep from 'lodash.flattendeep';

const { JsonHelper } = opticEngine.com.useoptic;
const jsonHelper = JsonHelper();

export function useBatchLearn(
  additionalCommands,
  isManual,
  eventStore,
  rfcId,
  endpointIds,
  diffService,
  setProgressTicker,
  onCompleted
) {
  const [allBodies, setAllBodies] = useState([]);

  useEffect(() => {
    async function process() {
      if (additionalCommands.length && Boolean(endpointIds)) {
        const batchHandler = batchCommandHandler(eventStore, rfcId);
        //update with the path commands
        batchHandler.doWork((emitCommands) => emitCommands(additionalCommands));

        const throttler = new Bottleneck({
          maxConcurrent: 5,
          minTime: 1,
        });

        endpointIds.forEach(({ pathId, method }) => {
          console.log(`learning scheduled ${pathId} ${method}`);
          throttler.schedule(async () => {
            batchHandler.doWork(async (emitCommands, queries, rfcState) => {
              if (isManual) {
                setProgressTicker((p) => p + 1); //don't try to learn.
              } else {
                const promise = diffService.learnInitial(
                  rfcState,
                  pathId,
                  method
                );

                promise.finally((i) => {
                  console.log(`learning finished ${pathId} ${method}`);
                  setProgressTicker((p) => p + 1);
                });
                try {
                  const result = await promise;
                  setAllBodies((current) => [...current, result]);
                } catch (e) {
                  console.error(e);
                }
              }
            });
          });
        });
      }
    }
    process();
  }, [additionalCommands.length, endpointIds]);

  useEffect(() => {
    if (!isManual && allBodies.length === (endpointIds && endpointIds.length)) {
      //manufacture suggestions

      const allCommands = flattenDeep(
        allBodies.map((i) => {
          return [
            i.requests.map((req) => req.commands),
            i.responses.map((req) => req.commands),
          ];
        })
      );

      //flatten requests and responses into one set of runnable commands
      // allBodies.forEach((i) => (commands = [...commands, ...i.commands]));
      onCompleted(allCommands);
    } else if (isManual && endpointIds) {
      onCompleted([]);
    }
  }, [allBodies, endpointIds]);
}

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
        batchHandler.doWork(({ emitCommands }) =>
          emitCommands(additionalCommands)
        );

        const throttler = new Bottleneck({
          maxConcurrent: 4,
          minTime: 100,
        });

        endpointIds.forEach(({ pathId, method }) => {
          throttler.schedule(async () => {
            console.log(`learning started for ${pathId} ${method}`);
            let promise;
            batchHandler.doWork(async ({ rfcService, rfcId }) => {
              if (isManual) {
                setProgressTicker((p) => p + 1); //don't try to learn.
                promise = Promise.resolve();
              } else {
                promise = diffService.learnInitial(
                  rfcService,
                  rfcId,
                  pathId,
                  method
                );
              }
            });

            if (!isManual) {
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

            await promise;
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

      const asScalaCommandsInJsArray = JsonHelper().vectorToJsArray(
        opticEngine.CommandSerialization.fromJs(allCommands)
      );

      //flatten requests and responses into one set of runnable commands
      // allBodies.forEach((i) => (commands = [...commands, ...i.commands]));
      onCompleted(asScalaCommandsInJsArray);
    } else if (isManual && endpointIds) {
      onCompleted([]);
    }
  }, [allBodies, endpointIds]);
}

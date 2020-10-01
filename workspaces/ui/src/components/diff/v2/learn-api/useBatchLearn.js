import { batchCommandHandler } from '../../../utilities/BatchCommandHandler';
import { useEffect, useState } from 'react';
import {
  getOrUndefined,
  opticEngine,
  OpticIds,
  RequestsCommands,
} from '@useoptic/domain';
import { DiffResultHelper } from '@useoptic/domain';

const { JsonHelper } = opticEngine.com.useoptic;
const jsonHelper = JsonHelper();

export function useBatchLearn(
  index,
  isDone,
  isManual,
  eventStore,
  rfcId,
  endpointIds,
  endpointDiffs,
  captureService,
  diffService,
  setProgressTicker,
  onCompleted
) {
  const [batchHandler] = useState(batchCommandHandler(eventStore, rfcId));
  const [allSuggestions, setAllSuggestions] = useState([]);
  const [confirmDone, setConfirmDone] = useState(false);

  useEffect(() => {
    async function compute() {
      const endpoint = endpointIds[index];
      if (isManual) {
        return setProgressTicker(index + 1);
      }
      if (endpoint) {
        const { pathId, method } = endpoint;
        console.log(`learning ${index}   ${method} ${pathId}`);

        let allPromises = [];

        batchHandler.doWork((emitCommands, queries, rfcState) => {
          const newRegionsToLearn = jsonHelper.seqToJsArray(
            DiffResultHelper.newRegionsForPathAndMethod(
              jsonHelper.jsArrayToSeq(endpointDiffs),
              pathId,
              method,
              rfcState,
              jsonHelper.jsArrayToSeq([]) //should be ignore...
            )
          );

          allPromises = newRegionsToLearn.map(async (i) => {
            const { interaction } = await captureService.loadInteraction(
              i.firstInteractionPointer
            );
            const { suggestion } = await diffService.loadInitialPreview(
              i,
              jsonHelper.fromInteraction(interaction),
              true
            );

            return getOrUndefined(suggestion);
          });
        });

        const newSuggestions = await Promise.all(allPromises);

        setAllSuggestions((suggestions) => [...suggestions, ...newSuggestions]);
        setProgressTicker(index + 1);
        setTimeout(() => {
          setConfirmDone(true);
        }, 50);
      }
    }
    if (index !== undefined && endpointIds) setTimeout(compute, 100);
  }, [index, endpointIds]);

  useEffect(() => {
    if (isDone && confirmDone) {
      onCompleted(allSuggestions);
    }
  }, [isDone, confirmDone]);
}

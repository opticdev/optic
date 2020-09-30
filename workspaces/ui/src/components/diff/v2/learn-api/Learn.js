import { batchCommandHandler } from '../../../utilities/BatchCommandHandler';
import { resolvePath } from '../../../utilities/PathUtilities';
import {
  DiffResultHelper,
  getOrUndefined,
  opticEngine,
  OpticIds,
  RequestsCommands,
} from '@useoptic/domain';
import {
  cleanupPathComponentName,
  pathStringToPathComponents,
} from '../AddUrlModal';

const { JsonHelper } = opticEngine.com.useoptic;
const jsonHelper = JsonHelper();

export function LearnPaths(eventStore, rfcId, currentPathExpressions) {
  const batchHandler = batchCommandHandler(eventStore, rfcId);
  const endpointIds = [];
  //learn paths
  currentPathExpressions.forEach((i) => {
    batchHandler.doWork((emitCommands, queries) => {
      const pathsById = queries.requestsState().pathComponents;
      let lastParentPathId;
      const commands = [];
      //create path if missing
      const pathComponents = pathStringToPathComponents(i.pathExpression);
      const { toAdd, lastMatch } = resolvePath(pathComponents, pathsById);
      lastParentPathId = lastMatch.pathId;
      toAdd.forEach((addition) => {
        const pathId = OpticIds.newPathId();
        const command = (addition.isParameter
          ? RequestsCommands.AddPathParameter
          : RequestsCommands.AddPathComponent)(
          pathId,
          lastParentPathId,
          cleanupPathComponentName(addition.name)
        );
        commands.push(command);
        lastParentPathId = pathId;
      });
      endpointIds.push({ method: i.method, pathId: lastParentPathId });
      emitCommands(commands);
    });
  });

  return {
    commands: batchHandler.getAllCommands(),
    endpointIds,
  };
}

export function getSamplesToLearnFrom(
  eventStore,
  rfcId,
  endpointIds,
  endpointDiffs,
  captureService,
  diffService,
  acceptSuggestion,
  setProgressTicker
) {
  const batchHandler = batchCommandHandler(eventStore, rfcId);

  let allPromises = [];

  endpointIds.forEach(({ pathId, method }, index) => {
    // endpointDiffs
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

      const promises = newRegionsToLearn.map(async (i) => {
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

      allPromises = allPromises.concat(promises);

      Promise.all(promises).finally(() => {
        setProgressTicker(index + 1);
      });
    });
  });

  Promise.all(allPromises).then(acceptSuggestion);
}

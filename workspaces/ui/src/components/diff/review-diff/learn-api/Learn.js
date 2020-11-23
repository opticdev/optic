import { batchCommandHandler } from '../../../utilities/BatchCommandHandler';
import { resolvePath } from '../../../utilities/PathUtilities';
import { opticEngine, OpticIds, RequestsCommands } from '@useoptic/domain';
import {
  cleanupPathComponentName,
  pathStringToPathComponents,
} from '../../v2/AddUrlModal';

const { JsonHelper } = opticEngine.com.useoptic;

export function LearnPaths(eventStore, rfcId, currentPathExpressions) {
  const batchHandler = batchCommandHandler(eventStore, rfcId);
  const endpointIds = [];
  //learn paths
  currentPathExpressions.forEach((i) => {
    batchHandler.doWork(({ emitCommands, queries }) => {
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
    commandsJS: batchHandler.getAllCommandsJs(),
    endpointIds,
  };
}

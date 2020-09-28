import { batchCommandHandler } from '../../../utilities/BatchCommandHandler';
import { resolvePath } from '../../../utilities/PathUtilities';
import { OpticIds, RequestsCommands } from '@useoptic/domain';
import {
  cleanupPathComponentName,
  pathStringToPathComponents,
} from '../AddUrlModal';

export function LearnPaths(eventStore, rfcId, currentPathExpressions) {
  const batchHanlder = batchCommandHandler(eventStore, rfcId);
  //learn paths
  currentPathExpressions.forEach((i) => {
    batchHanlder.doWork((emitCommands, queries) => {
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
      emitCommands(commands);
    });
  });

  return batchHanlder.getAllCommands();
}

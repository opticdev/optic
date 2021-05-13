import {
  IPathStringComponent,
  pathStringToPathComponents,
} from '<src>/optic-components/hooks/diffs/LearnInitialBodiesMachine';
import { IPendingEndpoint } from '<src>/optic-components/hooks/diffs/SharedDiffState';
import { IPath } from '<src>/optic-components/hooks/usePathsHook';
import { AddPathComponent, AddPathParameter } from '@useoptic/spectacle';
import { CurrentSpecContext } from '<src>/lib/Interfaces';

export function generatePathCommands(
  pendingEndpoints: IPendingEndpoint[],
  currentSpecContext: CurrentSpecContext
) {
  const currentPaths: IPath[] = currentSpecContext.currentSpecPaths;

  const commands: any[] = [];
  const stagedPaths: IPath[] = [];

  function resolveOrCreate(
    path: IPathStringComponent,
    parentPathId: string
  ): string {
    const sharedPredicate = (i: IPath) =>
      i.parentPathId === parentPathId &&
      i.name === cleanupPathComponentName(path.name) &&
      i.isParameterized === path.isParameter;

    const existingPathResult = currentPaths.find(sharedPredicate);
    const stagedPathsResult = stagedPaths.find(sharedPredicate);

    const result = existingPathResult || stagedPathsResult;
    if (result) {
      return result.pathId;
    } else {
      const newpathId = currentSpecContext.domainIds.newPathId();
      if (path.isParameter) {
        commands.push(
          AddPathParameter(
            newpathId,
            parentPathId,
            cleanupPathComponentName(path.name)
          )
        );
      } else {
        commands.push(
          AddPathComponent(
            newpathId,
            parentPathId,
            cleanupPathComponentName(path.name)
          )
        );
      }
      // stage it for subsequent lookups
      stagedPaths.push({
        pathId: newpathId,
        parentPathId,
        name: cleanupPathComponentName(path.name),
        isParameterized: path.isParameter,
        absolutePathPattern: '',
        absolutePathPatternWithParameterNames: '',
      });

      return newpathId;
    }
  }

  const endpointPathIdTuple = pendingEndpoints.map((i, index) => {
    const components = pathStringToPathComponents(i.pathPattern);
    let parentPathId = 'root';
    components.forEach((i) => {
      const newId = resolveOrCreate(i, parentPathId);
      parentPathId = newId;
    });

    return [i.id, parentPathId];
  });

  const endpointPathIdMap = endpointPathIdTuple.reduce(function (result, item) {
    //@ts-ignore
    result[item[0]] = item[1];
    return result;
  }, {});

  return { endpointPathIdMap, commands, stagedPaths };
}

function cleanupPathComponentName(name: string) {
  return name.replace(/[{}:]/gi, '');
}

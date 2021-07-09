import { IPendingEndpoint } from '<src>/pages/diffs/contexts/SharedDiffState';
import { IPath } from '<src>/types';
import {
  AddPathComponent,
  AddPathParameter,
  CQRSCommand,
} from '@useoptic/spectacle';
import { CurrentSpecContext } from '<src>/lib/Interfaces';

export function generatePathCommands(
  pendingEndpoints: IPendingEndpoint[],
  currentSpecContext: CurrentSpecContext
): {
  commands: CQRSCommand[];
  endpointPathIdMap: { [key: string]: string };
  stagedPaths: IPath[];
} {
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

export type IPathStringComponent = { name: string; isParameter: boolean };
export function pathStringToPathComponents(
  pathString: string
): IPathStringComponent[] {
  const components = pathString.split('/').map((name) => {
    const isParameter = name.charAt(0) === ':' || name.charAt(0) === '{';
    return { name, isParameter };
  });
  const [root, ...rest] = components;
  if (root.name === '') {
    return trimTrailingEmptyPath(rest);
  }
  return trimTrailingEmptyPath(components);
}

export function trimTrailingEmptyPath(components: any) {
  if (components.length > 0) {
    if (components[components.length - 1].name === '') {
      return components.slice(0, -1);
    }
  }
  return components;
}

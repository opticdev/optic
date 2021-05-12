import { pathStringToPathComponents } from '<src>/optic-components/hooks/diffs/LearnInitialBodiesMachine';
import { IPendingEndpoint } from '<src>/optic-components/hooks/diffs/SharedDiffState';
import { IPath } from '<src>/optic-components/hooks/usePathsHook';

export async function generatePathCommands(
  pendingEndpoints: IPendingEndpoint[]
) {
  // get from spectacle
  const currentPaths: IPath[] = [
    {
      pathId: 'root',
      parentPathId: null,
      absolutePathPattern: '/',
      absolutePathPatternWithParameterNames: '/',
      name: '',
      isParameterized: false,
    },
    {
      pathId: 'path_123',
      parentPathId: 'root',
      absolutePathPattern: '/',
      absolutePathPatternWithParameterNames: '/',
      name: '',
      isParameterized: false,
    },
  ];

  const allComponents = pendingEndpoints.map((i) =>
    pathStringToPathComponents(i.pathPattern)
  );

  console.log(allComponents);
}

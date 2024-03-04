import pluralize from 'pluralize';
import {
  OpenAPIV3,
  FlatOpenAPIV3,
  FlatOpenAPIV3_1,
} from '@useoptic/openapi-utilities';
import { CapturedInteractions } from '../../capture/sources/captured-interactions';
import { specToPaths } from '../../capture/operations/queries';
import {
  fragmentize,
  isTemplated,
  looksLikeAVariable,
  reservedPatterns,
} from '../../capture/operations/path-inference';

const COLLAPSE_CONSTANTS_N = 2;

type PathComponentCandidate = {
  name: string;
  httpMethods: Set<string>;
  inferred: 'constant' | 'variable';
  parent: PathComponentCandidate | null;
  verified: boolean; // provided by user, should not be changed
  examplePath?: string;
};

export class InferPathStructureLegacy {
  private paths: PathComponentCandidate[];
  constructor(
    private knownOperations: { pathPattern: string; methods: string[] }[] = []
  ) {
    const paths: PathComponentCandidate[] = [];

    function findMatch(
      parent: PathComponentCandidate | null,
      inferred: PathComponentCandidate['inferred'],
      name: string
    ): PathComponentCandidate | undefined {
      return paths.find(
        (i) => parent === i.parent && i.inferred === inferred && i.name === name
      );
    }

    knownOperations.forEach((operation) => {
      let parent: PathComponentCandidate | null = null;
      const fragments = fragmentize(operation.pathPattern);

      fragments.forEach((fragment, index) => {
        const isLast = fragments.length - 1 === index;
        const isVariable = isTemplated(fragment);
        const name = isVariable ? stripParamBrackets(fragment) : fragment;
        const match = findMatch(
          parent,
          isVariable ? 'variable' : 'constant',
          name
        );
        if (match) {
          if (isLast)
            operation.methods.forEach((method) =>
              match.httpMethods.add(method)
            );
          parent = match;
        } else if (!match) {
          const insert: PathComponentCandidate = {
            httpMethods: isLast ? new Set(operation.methods) : new Set(),
            parent: parent,
            name: name,
            inferred: isVariable ? 'variable' : 'constant',
            verified: true,
          };
          paths.push(insert);
          parent = insert;
        }
      });
    });

    this.paths = paths;
  }

  static async fromSpecAndInteractions(
    spec: FlatOpenAPIV3.Document | FlatOpenAPIV3_1.Document,
    interactions: CapturedInteractions
  ): Promise<InferPathStructureLegacy> {
    const inferredPathStructure = new InferPathStructureLegacy(
      specToPaths(spec)
    );
    for await (const interaction of interactions) {
      inferredPathStructure.includeObservedUrlPath(
        interaction.request.method,
        interaction.request.path
      );
    }
    inferredPathStructure.replaceConstantsWithVariables();

    return inferredPathStructure;
  }

  /*
    Be clever about when we use this.
      - maybe only run if we saw 200s
      - hostname matches
      - did not match other urls
   */

  includeObservedUrlPath = (method: string, urlPath: string): string | null => {
    const findMatch = (
      parent: PathComponentCandidate | null,
      inferred: PathComponentCandidate['inferred'],
      name: string
    ): PathComponentCandidate | undefined => {
      return this.paths.find(
        (i) =>
          parent === i.parent && // parent must match
          i.inferred === inferred && // type of component must match
          (inferred === 'constant' ? i.name === name : true) // if it is constant name matches
      );
    };
    const fragments = fragmentize(urlPath);

    let last: PathComponentCandidate | null = null;
    let parent: PathComponentCandidate | null = null;
    fragments.forEach((fragment, index) => {
      const isLast = fragments.length - 1 === index;
      const isFirst = index === 0;

      const constantMatch = findMatch(parent, 'constant', fragment);

      const variableMatch = findMatch(parent, 'variable', fragment);

      const match = constantMatch || variableMatch;

      if (match) {
        if (isLast) {
          match.httpMethods.add(method);
          match.examplePath = urlPath;
        }
        parent = match;
        if (isLast) last = match;
      } else if (!match) {
        const isConfidentVariable = !isFirst && looksLikeAVariable(fragment);
        const name = isConfidentVariable
          ? pluralize.singular(parent!.name)
          : fragment;

        const insert: PathComponentCandidate = {
          httpMethods: isLast ? new Set([method]) : new Set(),
          parent: parent,
          name: name,
          inferred: isConfidentVariable ? 'variable' : 'constant',
          verified: false,
          examplePath: pathToSegments(urlPath, index + 1),
        };
        this.paths.push(insert);
        parent = insert;
        if (isLast) last = insert;
      }
    });

    return last && reducePathPattern(last);
  };

  replaceConstantsWithVariables = () => {
    type ChangeToVariable = {
      insertVariable: PathComponentCandidate;
      toReplaceConstants: PathComponentCandidate[];
      andDescendants: PathComponentCandidate[];
    };

    const findMatchingVariables = (parent: PathComponentCandidate | null) => {
      const shouldReduce = this.paths
        // search top down
        .filter((i) => i.parent === parent)
        .map((component: PathComponentCandidate) => {
          const children = this.paths.filter((i) => i.parent === component);
          // never try to make variables for something after a variable
          const sharedVariableParent = (() => {
            const parentSet = new Set([...children.map((i) => i.parent)]);
            if (
              parentSet.size === 1 &&
              [...parentSet][0]!.inferred === 'variable'
            )
              return true;
            return false;
          })();

          // check for children, not at slot 0, not after a variable
          if (
            children.length > 0 &&
            children[0].parent !== null &&
            !parentIsNeverResource(children[0].parent.name) &&
            !sharedVariableParent
          ) {
            // incorporate verified from spec
            const numberOfVerified = children.filter((i) => i.verified).length;

            if (children.length - numberOfVerified >= COLLAPSE_CONSTANTS_N) {
              const toCollapse = children.filter((i) => !i.verified);

              const httpMethods = new Set(
                toCollapse.map((i) => [...i.httpMethods]).flat(1)
              );

              const insertVariable: PathComponentCandidate = {
                name: pluralize.singular(children[0].parent?.name || 'id'),
                parent: children[0].parent,
                inferred: 'variable',
                httpMethods,
                verified: false,
                examplePath: toCollapse[0]?.examplePath,
              };

              const descendants = this.paths.filter(
                (i) => i.parent && toCollapse.includes(i.parent)
              );

              const update: ChangeToVariable = {
                insertVariable,
                toReplaceConstants: toCollapse,
                andDescendants: descendants,
              };

              return update;
            }
          }
          return findMatchingVariables(component);
        })
        .filter(Boolean);
      return shouldReduce[0];
    };

    let reduce: ChangeToVariable | undefined = findMatchingVariables(null);

    while (typeof reduce !== 'undefined') {
      let graph = [...this.paths];

      // update the graph
      graph.push(reduce.insertVariable);

      [...reduce!.toReplaceConstants, ...reduce!.andDescendants].forEach(
        (comp) => {
          const index = graph.indexOf(comp);
          if (index !== -1) graph.splice(index, 1);
        }
      );

      const uniqueConstants = new Set(
        reduce!.andDescendants
          .filter((i) => i.inferred === 'constant')
          .map((i) => i.name)
      );

      const combinedHttpMethods = new Set(
        reduce!.andDescendants.map((i) => Array.from(i.httpMethods)).flat(1)
      );

      uniqueConstants.forEach((constant) => {
        const examplePath = reduce!.andDescendants.find(
          (i) => i.name === constant
        )?.examplePath;

        const newConstant: PathComponentCandidate = {
          parent: reduce!.insertVariable,
          name: constant,
          verified: false,
          inferred: 'constant',
          httpMethods: combinedHttpMethods,
          examplePath: examplePath,
        };
        graph.push(newConstant);
        reduce!.andDescendants.forEach((old) => {
          if (old.name === constant && old.inferred === 'constant')
            graph = graph.map((i) => {
              if (i.parent === old) i.parent = newConstant;
              return i;
            });
        });
      });

      const uniqueVariables = new Set(
        reduce!.andDescendants
          .filter((i) => i.inferred === 'variable')
          .map((i) => i.name)
      );

      uniqueVariables.forEach((variable) => {
        const examplePath = reduce!.andDescendants.find(
          (i) => i.name === variable
        )?.examplePath;

        const newVariable: PathComponentCandidate = {
          parent: reduce!.insertVariable,
          name: variable,
          verified: false,
          inferred: 'variable',
          httpMethods: combinedHttpMethods,
          examplePath,
        };
        graph.push(newVariable);
        reduce!.andDescendants.forEach((old) => {
          if (old.name === variable && old.inferred === 'variable')
            graph = graph.map((i) => {
              if (i.parent === old) i.parent = newVariable;
              return i;
            });
        });
      });

      this.paths = graph;
      reduce = findMatchingVariables(null);
    }
  };

  undocumentedPaths: () => {
    methods: Array<OpenAPIV3.HttpMethods>;
    pathPattern: string;
    examplePath: string;
  }[] = () => {
    return this.paths
      .map((pathComponent) => {
        const pathPattern = reducePathPattern(pathComponent);

        const methods = Array.from(pathComponent.httpMethods).filter(
          (method) => {
            // skip known operations
            return !this.knownOperations.some(
              (i) => i.pathPattern === pathPattern && i.methods.includes(method)
            );
          }
        ) as Array<OpenAPIV3.HttpMethods>;

        return {
          methods,
          pathPattern,
          examplePath: pathComponent.examplePath ?? '',
        };
      })
      .filter((i) => i.methods.length > 0);
  };
}

function reducePathPattern(component: PathComponentCandidate): string {
  let i: PathComponentCandidate | null = component;
  const pathPatternComponents: string[] = [];
  while (i !== null) {
    pathPatternComponents.push(
      i.inferred === 'variable' ? `{${i.name}}` : i.name
    );
    i = i.parent;
  }

  return '/' + pathPatternComponents.reverse().join('/');
}

function pathToSegments(path: string, n: number) {
  const withoutLeading = path.split('/').filter((i) => Boolean(i));
  return '/' + withoutLeading.slice(0, n).join('/');
}

function stripParamBrackets(input: string): string {
  if (!input.startsWith('{')) throw new Error('must start with {');
  if (!input.endsWith('}')) throw new Error('must end with }');
  return input.substring(1, input.length - 1);
}

function parentIsNeverResource(parent: string): boolean {
  return reservedPatterns.some((pattern) => pattern.test(parent));
}

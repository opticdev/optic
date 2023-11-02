import pluralize from 'pluralize';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { CapturedInteractions } from '../sources/captured-interactions';
import { specToPaths } from './queries';

const COLLAPSE_CONSTANTS_N = 2;

const PATH_VARIABLE_KEY = '{}';

class PathNode {
  constructor(
    public name: string,
    public children: Map<string, PathNode>
  ) {}
}

export class PathInference {
  private root: PathNode;
  private observedUrls: Set<string>;

  constructor() {
    this.root = new PathNode('root', new Map());
    this.observedUrls = new Set();
  }

  addKnownPath(path: string) {
    let currentNode = this.root;
    for (const part of fragmentize(path)) {
      const key = isTemplated(part) ? PATH_VARIABLE_KEY : part;
      let matchedChild = currentNode.children.get(part);
      if (!matchedChild) {
        matchedChild = new PathNode(part, new Map());
        currentNode.children.set(key, matchedChild);
      }
      currentNode = matchedChild;
    }
  }

  addObservedUrl(url: string) {
    this.observedUrls.add(url);
  }

  getInferedPattern(url: string): string {
    const builtUrl: string[] = [];
    let currentNode: PathNode | null = this.root;
    for (const part of fragmentize(url)) {
      const siblingConstantKeys: string[] = [];
      // Try build the URL with known paths first
      if (currentNode) {
        let variableNode: PathNode | null = null;
        let constantNode: PathNode | null = null;
        // always match constants first, then use variables
        for (const [key, node] of currentNode.children.entries()) {
          if (key === PATH_VARIABLE_KEY) {
            variableNode = node;
          } else {
            if (key === part) {
              constantNode = node;
            }
            siblingConstantKeys.push(node.name);
          }
        }

        const nextNode = constantNode || variableNode;
        if (nextNode) {
          builtUrl.push(nextNode.name);
          currentNode = nextNode;
          continue;
        } else {
          currentNode = null;
        }
      }

      // Otherwise, we don't have a known path anymore, and we need to infer based on observed urls
      // Rules for selecting a variable:
      // - Parent is not a resource
      // - Parent is not a variable
      // - Current is not first item
      // - Then we look at:
      //   - Does it look like a variable (uuid, number, is not a reserved path)
      //   - Does not have any sibilings that are constant known paths
      //   - Does it have more than 1 interaction matched
      // If not a variable, we use the current part as the URL
      const parentPart: string | null = builtUrl[builtUrl.length - 1] ?? null;
      const isFirst = parentPart === null;
      const parentIsVariable = parentPart !== null && isTemplated(parentPart);
      const parentIsResource =
        parentPart !== null && reservedPatterns.some((r) => r.test(parentPart));
      const hasAnyConstantSibilings = siblingConstantKeys.length > 0;
      const isVariable = looksLikeAVariable(part);
      const uniqueUrlsStartingWithCurrent = [
        ...this.observedUrls.values(),
      ].filter((url) => {
        const urlFragments = fragmentize(url);
        if (urlFragments.length < builtUrl.length) return false;
        for (let i = 0; i < builtUrl.length; i++) {
          if (!isTemplated(builtUrl[i]) && builtUrl[i] !== urlFragments[i])
            return false;
        }
        return true;
      });
      // First, check conditions that we will never assume a variable
      if (isFirst || parentIsVariable || parentIsResource) {
        builtUrl.push(part);
      } else {
        if (
          isVariable ||
          (uniqueUrlsStartingWithCurrent.length >= COLLAPSE_CONSTANTS_N &&
            !hasAnyConstantSibilings)
        ) {
          const variableName = pluralize.singular(parentPart);
          builtUrl.push(`{${variableName}}`);
        } else {
          builtUrl.push(part);
        }
      }
    }

    return `/${builtUrl.join('/')}`;
  }
}

export function fragmentize(path: string): string[] {
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }
  return path.split('/').slice(1).map(decodeURIComponent);
}

export function isTemplated(pathFragment: string) {
  return /^{.+}$/.test(pathFragment);
}

export const reservedPatterns = [
  /^api$/,
  /^v[0-9]+$/,
  /^[0-9]+\.[0-9]+$/,
  /^20[0-9][0-9]-[0-9][0-9]-[0-9][0-9]$/,
];

export function looksLikeAVariable(stringValue: string): boolean {
  if (reservedPatterns.some((pattern) => pattern.test(stringValue)))
    return false;

  if (stringValue)
    if (!isNaN(Number(stringValue)))
      // any number is a variable
      return true;
  // any uuid is a variable
  if (
    /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(
      stringValue
    ) ||
    /^[0-9A-F]{8}-[0-9A-F]{4}-[5][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(
      stringValue
    )
  )
    return true;

  return false;
}

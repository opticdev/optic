import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { IFact } from './sdk/types';

export type FactTree = Record<
  string,
  { fact: IFact | null; children: FactTree }
>;

export function constructFactTree(facts: IFact[]): FactTree {
  const factTree: FactTree = {};
  for (const fact of facts) {
    let tree: FactTree = factTree;
    const pathParts = jsonPointerHelpers.decode(fact.location.jsonPath);
    const leadingPaths = pathParts.slice(0, -1);
    const trailingPath = pathParts.slice(-1)[0];

    for (const part of leadingPaths) {
      if (!tree[part]) {
        tree[part] = { fact: null, children: {} };
      } else {
        tree = tree[part].children;
      }
    }
    tree[trailingPath].fact = fact;
  }

  return factTree;
}

export function getFactForJsonPath(
  jsonPath: string,
  factTree: FactTree
): IFact | null {
  let fact: IFact | null = null;
  let tree = factTree;

  for (const part of jsonPointerHelpers.decode(jsonPath)) {
    const node = tree[part];
    if (!node) {
      break;
    }
    if (node.fact) {
      fact = node.fact;
    }
    tree = node.children;
  }
  return fact;
}

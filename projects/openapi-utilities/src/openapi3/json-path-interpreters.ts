import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { IFact } from './sdk/types';

// A trie datastructure keyed by json path parts
export type FactTree = Record<
  string,
  { fact: IFact | null; children: FactTree }
>;

// We need a special json path decoder since the leading / is significant and points to the root
const decodePathWithLeadingTrail = (pointer: string) => pointer.split('/').map(jsonPointerHelpers.unescape);

export function constructFactTree(facts: IFact[]): FactTree {
  const factTree: FactTree = {};
  for (const fact of facts) {
    let tree: FactTree = factTree;
    const pathParts = decodePathWithLeadingTrail(fact.location.jsonPath);

    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      if (!tree[part]) {
        tree[part] = { fact: null, children: {} };
      }
      // If it's the last iteration, it's the node where the fact should live
      if (i === pathParts.length - 1) {
        tree[part].fact = fact;
      }
      // Set up the next loop
      tree = tree[part].children;
    }
  }

  return factTree;
}

export function getFactForJsonPath(
  jsonPath: string,
  factTree: FactTree
): IFact | null {
  let fact: IFact | null = null;
  let tree = factTree;

  for (const part of decodePathWithLeadingTrail(jsonPath)) {
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

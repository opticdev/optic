import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

interface FactLike {
  location: {
    jsonPath: string;
  };
}

// A trie datastructure keyed by json path parts
export type FactTree<T extends FactLike> = Record<
  string,
  { fact: T | null; children: FactTree<T> }
>;

// We need a special json path decoder since the leading / is significant and points to the root
const decodePathWithLeadingTrail = (pointer: string) =>
  pointer.split('/').map(jsonPointerHelpers.unescape);

export function constructFactTree<T extends FactLike>(facts: T[]): FactTree<T> {
  const factTree: FactTree<T> = {};
  for (const fact of facts) {
    let tree: FactTree<T> = factTree;
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

export function getFactForJsonPath<T extends FactLike>(
  jsonPath: string,
  factTree: FactTree<T>
): T | null {
  let fact: T | null = null;
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

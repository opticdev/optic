import {
  Kind,
  YamlMap,
  YAMLMapping,
  YAMLNode,
  YAMLSequence,
} from 'yaml-ast-parser';
import invariant from 'ts-invariant';
import { lines, startsWithWhitespace } from './lines';

function isObject(yamlNode: YAMLNode): boolean {
  if (yamlNode.kind === Kind.MAPPING) {
    return (yamlNode as YAMLMapping).value.kind === Kind.MAP;
  } else return yamlNode.kind === Kind.MAP;
}

function getObjectMapNode(yamlNode: YAMLNode): YamlMap {
  if (yamlNode.kind === Kind.MAPPING) {
    if ((yamlNode as YAMLMapping).value.kind === Kind.MAP) {
      return yamlNode.value as YamlMap;
    }
  } else if (yamlNode.kind === Kind.MAP) {
    return yamlNode as YamlMap;
  }

  invariant(false, `can not find map node for ${yamlNode}`);
}
function getArrayNode(yamlNode: YAMLNode): YAMLSequence {
  if (yamlNode.kind === Kind.MAPPING) {
    if ((yamlNode as YAMLMapping).value.kind === Kind.SEQ) {
      return yamlNode.value as YAMLSequence;
    }
  } else if (yamlNode.kind === Kind.SEQ) {
    return yamlNode as YAMLSequence;
  }

  invariant(false, `can not find array node for ${yamlNode}`);
}

function lineForContents(contents: string) {
  const contentLines = lines(contents);

  return {
    lookup: (offset: number) => {
      const match = contents.substring(0, offset).match(/\r?\n/g);
      return match ? match.length : 0;
    },
    contentsForLine(line: number) {
      invariant(contentLines[line], `line ${line} not found`);
    },
    leadingWhitespaceForLine(line: number) {
      invariant(contentLines[line], `line ${line} not found`);
      const lineContent = contentLines[line];
      return startsWithWhitespace(lineContent) || '';
    },
  };
}

function keys(parent: YamlMap): string[] {
  return parent.mappings.map((i: YAMLMapping) => i.key.value);
}

function ensureKeyIsFree(parent: YamlMap, key: string) {
  invariant(
    !keys(parent).includes(key),
    `ast object parent already has key ${key}`
  );
}

function isArray(yamlNode: YAMLNode): boolean {
  if (yamlNode.kind === Kind.MAPPING) {
    return (yamlNode as YAMLMapping).value.kind === Kind.SEQ;
  } else return yamlNode.kind === Kind.SEQ;
}

function toReplace(astNode: YAMLNode): YAMLNode {
  if (astNode.kind === Kind.MAPPING) {
    return astNode.value;
  }

  return astNode;
}

export default {
  isObject,
  isArray,
  toReplace,
  getObjectMapNode,
  getArrayNode,
  ensureKeyIsFree,
  keys,
  lineForContents,
};

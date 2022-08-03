import {
  ParseResult,
  PatchApplyResult,
  ReduceOperationType,
  RoundtripProvider,
} from '../roundtrip-provider';
import jsonpatch, { AddOperation, Operation } from 'fast-json-patch';
import { lines, replaceRange, startsWithWhitespace } from '../helpers/lines';
import fs from 'fs-extra';
import { safeLoad, YamlMap, YAMLSequence } from 'yaml-ast-parser';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { resolveJsonPointerInYamlAst } from '../../parser/openapi-sourcemap-parser';
import invariant from 'ts-invariant';
import ast from '../helpers/ast';
import jsonLike from '../helpers/json-like';
import { formatJson } from '../helpers/format/format';
import { findNextChar, findPreviousChar } from '../helpers/next-or-last-char';

const { EOL } = require('os');

export type JsonRoundtripConfig = {
  spacer: 'tab' | 'space';
  count: number;
};
//
class JsonRoundtripImpl implements RoundtripProvider<JsonRoundtripConfig> {
  async applyPatches(
    filePath: string,
    fileContents: string,
    operations: Operation[],
    config: JsonRoundtripConfig | undefined
  ): Promise<PatchApplyResult> {
    const writeConfig = config ? config : await this.inferConfig(fileContents);
    const initialDocument = await this.parse(filePath, fileContents);

    invariant(
      initialDocument.success === true,
      // @ts-ignore
      `could not parse '${filePath}' as json. Error: ${initialDocument.error}`
    );

    // copy because we've discovered patcher may mutate patches when applying
    const ops: Operation[] = JSON.parse(JSON.stringify(operations));

    const reducerInput: ReduceOperationType = {
      contents: fileContents,
      currentValue: initialDocument.value,
    };

    try {
      const updatedDocument = ops.reduce(
        (input: ReduceOperationType, operation: Operation, index: number) => {
          const currentValue = jsonpatch.applyReducer(
            input.currentValue,
            operation,
            index
          );

          const contents = applyJsonPatchOperationToString(
            input.contents,
            currentValue,
            operation,
            writeConfig
          );

          return { currentValue, contents };
        },
        reducerInput
      );

      const formatted = formatJson(updatedDocument.contents, writeConfig);

      return {
        success: true,
        value: updatedDocument.currentValue,
        asString: formatted,
        filePath,
      };
    } catch (e: any) {
      return { success: false, error: e.message, filePath };
    }
  }

  fileExtensions: string[] = ['.json'];

  async inferConfig(contents: string): Promise<JsonRoundtripConfig> {
    const asLines = lines(contents);

    // it's all one line, we'll be overwriting today
    if (asLines.length <= 1) {
      return { spacer: 'space', count: 2 };
    }

    const firstLineWithWhiteSpaceToStart = asLines.find((i) =>
      startsWithWhitespace(i)
    );
    if (firstLineWithWhiteSpaceToStart) {
      const startChar = startsWithWhitespace(
        firstLineWithWhiteSpaceToStart
      ) as string;

      if (startChar.includes('\t')) {
        return {
          spacer: 'tab',
          count: Array.from(startChar).filter((i) => i === '\t').length,
        };
      }
      if (startChar.includes(' ')) {
        return {
          spacer: 'space',
          count: Array.from(startChar).filter((i) => i === ' ').length,
        };
      }
    }

    return { spacer: 'space', count: 2 };
  }

  name: string = 'json';

  async parse(filepath: string, contents: string): Promise<ParseResult> {
    try {
      const value = JSON.parse(contents);
      return { value, success: true };
    } catch (e: any) {
      return { error: e.message, success: false };
    }
  }
}

export const JsonRoundtripper = new JsonRoundtripImpl();

// Patch Logic
export function applyJsonPatchOperationToString(
  contents: string,
  jsonLikeValue: any,
  operation: Operation,
  writeConfig: JsonRoundtripConfig
): string {
  const astRoot = safeLoad(contents);

  invariant(
    astRoot.errors.length === 0,
    'error loading ast ' + astRoot.errors.length
  );

  switch (operation.op) {
    case 'add': {
      const addOperation = operation as AddOperation<any>;
      const [parentPath, key, childPath] = jsonPointerHelpers.splitParentChild(
        addOperation.path
      );

      const parentAstNode = resolveJsonPointerInYamlAst(astRoot, parentPath);
      const parentJsonLikeNode = jsonPointerHelpers.tryGet(
        jsonLikeValue,
        parentPath
      );

      invariant(
        Boolean(parentAstNode) && parentJsonLikeNode.match,
        `parent AST node at ${parentPath} not found`
      );

      if (parentAstNode && ast.isObject(parentAstNode)) {
        // verify parent type matches AST Type we got
        invariant(
          jsonLike.isObject(parentJsonLikeNode.value),
          'AST node and Json Value must both be object'
        );

        const parentObjectAst = ast.getObjectMapNode(parentAstNode);
        ast.ensureKeyIsFree(parentObjectAst, key);

        const newField = jsonLike.generatedAddedField(
          key,
          operation.value,
          writeConfig
        );

        return addFieldToObject(parentObjectAst, contents, newField);
      }

      if (parentAstNode && ast.isArray(parentAstNode)) {
        const parentArrayAst = ast.getArrayNode(parentAstNode);

        const newItem = jsonLike.generatedAdded(operation.value, writeConfig);
        const addIndex: number =
          key === '-' ? parentArrayAst.items.length : Number(key);

        invariant(
          !isNaN(addIndex) && addIndex <= parentArrayAst.items.length,
          'array insert index outside of bounds'
        );

        // verify parent type matches AST Type we got
        invariant(
          jsonLike.isArray(parentJsonLikeNode.value),
          'AST node and Json Value must both be object'
        );

        return addItemToArray(
          parentArrayAst,
          contents,
          newItem,
          addIndex,
          writeConfig
        );
      }

      invariant(
        false,
        'add operations can only be applied to parents that are ararys or objects'
      );

      break;
    }
    case 'remove': {
      const [parentPath, key, childPath] = jsonPointerHelpers.splitParentChild(
        operation.path
      );

      const parentAstNode = resolveJsonPointerInYamlAst(astRoot, parentPath);
      const parentJsonLikeNode = jsonPointerHelpers.tryGet(
        jsonLikeValue,
        parentPath
      );

      invariant(
        Boolean(parentAstNode) && parentJsonLikeNode.match,
        `parent AST node at ${parentPath} not found`
      );

      if (parentAstNode && ast.isObject(parentAstNode)) {
        const parentObjectAst = ast.getObjectMapNode(parentAstNode);

        // verify parent type matches AST Type we got
        invariant(
          jsonLike.isObject(parentJsonLikeNode.value),
          'AST node and Json Value must both be object'
        );

        invariant(
          Boolean(parentObjectAst.mappings.find((i) => i.key.value === key)),
          `AST mapping node must contain key '${key}' to remove it`
        );

        return removeFieldFromObject(parentObjectAst, contents, key);
      }

      if (parentAstNode && ast.isArray(parentAstNode)) {
        const parentArrayAst = ast.getArrayNode(parentAstNode);
        // verify parent type matches AST Type we got
        invariant(
          jsonLike.isArray(parentJsonLikeNode.value),
          'AST node and Json Value must both be object'
        );

        invariant(
          !isNaN(Number(key)),
          'AST node remove index must be a number: ' + key
        );

        return removeItemFromArray(parentArrayAst, contents, Number(key));
      }

      invariant(
        false,
        'remove operations can only be applied to parents that are ararys or objects'
      );

      break;
    }
    case 'replace': {
      const node = resolveJsonPointerInYamlAst(astRoot, operation.path);
      invariant(node, 'node to update can not be found at ' + operation.path);
      const astNode = ast.toReplace(node);

      const generated = jsonLike.generatedAdded(operation.value, writeConfig);

      return replaceRange(
        contents,
        astNode.startPosition,
        astNode.endPosition,
        generated
      );
    }

    default:
      invariant(
        false,
        'roundtrip json does not support json path: ' + operation.op
      );
  }
}

function addFieldToObject(
  parentAst: YamlMap,
  contents: string,
  fieldString: string
) {
  const isEmptyObject = ast.keys(parentAst).length === 0;
  if (isEmptyObject) {
    const append = `${fieldString}`;
    return replaceRange(
      contents,
      parentAst.startPosition + 1,
      parentAst.startPosition + 1,
      append
    );
  } else {
    const lastField = parentAst.mappings[parentAst.mappings.length - 1];
    const readyForInsert = `, ${fieldString}`;
    return replaceRange(
      contents,
      lastField.endPosition,
      parentAst.endPosition - 1,
      readyForInsert
    );
  }
}

function removeFieldFromObject(
  parentAst: YamlMap,
  contents: string,
  key: string
) {
  const keyIndex = parentAst.mappings.findIndex((i) => i.key.value === key);
  const numberOfKeys = parentAst.mappings.length;

  const isOnlyKey = numberOfKeys === 1;

  const isFirstKey = keyIndex === 0;
  const isLastKey = keyIndex + 1 === numberOfKeys;

  const item = parentAst.mappings.find((i) => i.key.value === key)!;

  if (isFirstKey) {
    // decide if we need to grab the next comma
    const removeEnd = isOnlyKey
      ? item.endPosition
      : findNextChar(contents, ',', item.endPosition);

    return replaceRange(contents, item.startPosition, removeEnd, '');
  } else if (isLastKey) {
    const removeStart = isOnlyKey
      ? item.startPosition
      : findPreviousChar(contents, ',', item.startPosition);

    return replaceRange(contents, removeStart, item.endPosition, '');
  } else {
    // is middle
    return replaceRange(
      contents,
      item.startPosition,
      parentAst.mappings[keyIndex + 1].startPosition,
      ''
    );
  }
}

export function removeItemFromArray(
  parentSequence: YAMLSequence,
  contents: string,
  index: number
) {
  const numberOfKeys = parentSequence.items.length;

  const isOnlyKey = numberOfKeys === 1;

  const isFirstKey = index === 0;
  const isLastKey = index + 1 === numberOfKeys;

  const item = parentSequence.items[index];

  if (isFirstKey) {
    // decide if we need to grab the next comma
    const removeEnd = isOnlyKey
      ? item.endPosition
      : findNextChar(contents, ',', item.endPosition);

    return replaceRange(contents, item.startPosition, removeEnd, '');
  } else if (isLastKey) {
    const removeStart = isOnlyKey
      ? item.startPosition
      : findPreviousChar(contents, ',', item.startPosition);

    return replaceRange(contents, removeStart, item.endPosition, '');
  } else {
    const next = parentSequence.items[index + 1];
    // is middle
    return replaceRange(contents, item.startPosition, next.startPosition, '');
  }
}

function addItemToArray(
  parentAst: YAMLSequence,
  contents: string,
  newItem: string,
  index: number,
  writeConfig: JsonRoundtripConfig
) {
  const isAddingLastItem = parentAst.items.length === index;
  const isAddingFirstItem = index === 0;

  if (isAddingFirstItem) {
    const insert = `${newItem}${parentAst.items.length > 0 ? ', ' : ''}`;
    return replaceRange(
      contents,
      parentAst.startPosition + 1,
      parentAst.startPosition + 1,
      insert
    );
  } else if (isAddingLastItem) {
    const insert = `, ${newItem}`;
    return replaceRange(
      contents,
      parentAst.endPosition - 1,
      parentAst.endPosition - 1,
      insert
    );
  } else {
    const insert = ` ${newItem} , `;
    const itemAfter = parentAst.items[index];
    return replaceRange(
      contents,
      itemAfter.startPosition,
      itemAfter.startPosition,
      insert
    );
  }
}

import {
  ParseResult,
  PatchApplyResult,
  ReduceOperationType,
  RoundtripProvider,
} from '../roundtrip-provider';
import jsonpatch, { AddOperation, Operation } from 'fast-json-patch';
import {
  insertLines,
  lines,
  pad,
  removeLines,
  replaceRange,
  startsWithWhitespace,
  yamlSpacer,
} from '../helpers/lines';
import fs from 'fs-extra';
import {
  Kind,
  safeLoad,
  YamlMap,
  YAMLMapping,
  YAMLSequence,
} from 'yaml-ast-parser';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { resolveJsonPointerInYamlAst } from '../../parser/openapi-sourcemap-parser';
import invariant from 'ts-invariant';
import ast from '../helpers/ast';
import jsonLike from '../helpers/json-like';
import yamlLike from '../helpers/yaml-like';
import { formatYaml } from '../helpers/format/format';
import {
  returnLineForPosition,
  returnLineNumberPosition,
} from '../helpers/next-or-last-char';
import { loadYaml } from '../../write';

const { EOL } = require('os');

export type YamlRoundTripConfig = {
  count: 2 | 4;
};

class YamlRoundtripImpl implements RoundtripProvider<YamlRoundTripConfig> {
  async applyPatches(
    filePath: string,
    fileContents: string,
    operations: Operation[],
    config: YamlRoundTripConfig | undefined
  ): Promise<PatchApplyResult> {
    const writeConfig = config ? config : await this.inferConfig(fileContents);
    const initialDocument = await this.parse(filePath, fileContents);

    invariant(
      initialDocument.success,
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

      const formatted = formatYaml(updatedDocument.contents, writeConfig);

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

  fileExtensions: string[] = ['.yaml', '.yml'];

  async inferConfig(contents: string): Promise<YamlRoundTripConfig> {
    const asLines = lines(contents);

    // it's all one line, we'll be overwriting today
    if (asLines.length <= 1) {
      return { count: 2 };
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
          count:
            Array.from(startChar).filter((i) => i === '\t').length === 4
              ? 4
              : 2,
        };
      }
      if (startChar.includes(' ')) {
        return {
          count:
            Array.from(startChar).filter((i) => i === '\t').length === 4
              ? 4
              : 2,
        };
      }
    }

    return { count: 2 };
  }

  name: string = 'yaml';

  async parse(filepath: string, contents: string): Promise<ParseResult> {
    try {
      const value = loadYaml(contents);
      return { value, success: true };
    } catch (e: any) {
      return { error: e.message, success: false };
    }
  }
}

export const YamlRoundtripper = new YamlRoundtripImpl();

// Patch Logic
export function applyJsonPatchOperationToString(
  contents: string,
  jsonLikeValue: any,
  operation: Operation,
  writeConfig: YamlRoundTripConfig
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

        const newField = yamlLike.generatedAddedField(
          key,
          operation.value,
          writeConfig
        );

        return addFieldToObject(
          parentObjectAst,
          contents,
          newField,
          writeConfig
        );
      }

      if (parentAstNode && ast.isArray(parentAstNode)) {
        const parentArrayAst = ast.getArrayNode(parentAstNode);

        const newItem = yamlLike.generatedAdded(operation.value, writeConfig);
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
      const astNode = resolveJsonPointerInYamlAst(astRoot, operation.path)!;
      invariant(
        astNode,
        'node to update can not be found at ' + operation.path
      );
      const generated = yamlLike.generatedAdded(operation.value, writeConfig);

      const line = returnLineForPosition(contents, astNode.startPosition);
      const leadingWhitespace = startsWithWhitespace(line) || '';

      if (astNode.kind === Kind.MAPPING) {
        const asMapping = astNode as YAMLMapping;
        const replacingWithCollection =
          jsonLike.isObject(operation.value) ||
          jsonLike.isArray(operation.value);
        const leadingEol =
          lines(generated).length > 1 || replacingWithCollection ? EOL : '';
        const replace = pad(
          `${leadingEol}${generated}`,
          leadingWhitespace + yamlSpacer(writeConfig)
        )
          .withLeading(`${leadingWhitespace}${asMapping.key.value}: `)
          .flush();

        return replaceRange(
          contents,
          asMapping.startPosition,
          asMapping.endPosition,
          replace
        );
      } else {
        const spacer = yamlSpacer(writeConfig);
        const replace = pad(generated, leadingWhitespace + spacer)
          .withLeading('')
          .flush();
        return replaceRange(
          contents,
          astNode.startPosition,
          astNode.endPosition,
          replace
        );
      }
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
  fieldString: string,
  writeConfig: YamlRoundTripConfig
) {
  const isEmptyObject = ast.keys(parentAst).length === 0;
  if (isEmptyObject) {
    const line = returnLineForPosition(contents, parentAst.startPosition);
    const leadingWhitespace = startsWithWhitespace(line) || '';
    const spacer = yamlSpacer(writeConfig);
    const replace = pad(fieldString, leadingWhitespace + spacer + spacer)
      .withLeading('\n' + leadingWhitespace + spacer)
      .flush();
    return replaceRange(
      contents,
      parentAst.startPosition,
      parentAst.endPosition,
      replace
    );
  } else {
    const lastField = parentAst.mappings[parentAst.mappings.length - 1];

    const line = returnLineForPosition(contents, lastField.startPosition);
    const leadingWhitespace = startsWithWhitespace(line) || '';

    const insert = pad(fieldString, leadingWhitespace)
      .withLeading('\n' + leadingWhitespace)
      .flush();

    return replaceRange(
      contents,
      lastField.endPosition,
      lastField.endPosition,
      insert
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

  const item = parentAst.mappings.find((i) => i.key.value === key)!;

  if (isOnlyKey) {
    return replaceRange(
      contents,
      parentAst.startPosition,
      parentAst.endPosition,
      '{}'
    );
  }

  const startLine = returnLineNumberPosition(contents, item.startPosition);

  const endLine = returnLineNumberPosition(contents, item.endPosition);

  return removeLines(contents, startLine, endLine);
}

function removeItemFromArray(
  parentAst: YAMLSequence,
  contents: string,
  index: number
) {
  const toRemove = parentAst.items[index];
  const numberOfKeys = parentAst.items.length;

  const isOnlyItem = numberOfKeys === 1;

  if (isOnlyItem) {
    return replaceRange(
      contents,
      parentAst.startPosition,
      parentAst.endPosition,
      '[]'
    );
  }

  const startLine = returnLineNumberPosition(contents, toRemove.startPosition);

  const endLine = returnLineNumberPosition(contents, toRemove.endPosition);

  return removeLines(contents, startLine, endLine);
}

function addItemToArray(
  parentAst: YAMLSequence,
  contents: string,
  newItem: string,
  index: number,
  writeConfig: YamlRoundTripConfig
) {
  const isAddingLastItem = parentAst.items.length === index;
  const isAddingFirstItem = index === 0;
  const isAddingToEmptyArray =
    isAddingFirstItem && parentAst.items.length === 0;

  if (isAddingToEmptyArray) {
    const line = returnLineForPosition(contents, parentAst.startPosition);
    const parentLine = returnLineNumberPosition(
      contents,
      parentAst.startPosition
    );

    const leadingWhitespace = startsWithWhitespace(line) || '';

    const insert = pad(newItem, leadingWhitespace + '  ')
      .withLeading(`${EOL}${leadingWhitespace}- `)
      .withTrailing(EOL)
      .flush();

    return replaceRange(
      contents,
      parentAst.startPosition,
      parentAst.endPosition,
      insert
    );
  } else if (isAddingFirstItem) {
    // not done yet
    const itemAfter = parentAst.items[index + 1];
    const line = returnLineForPosition(contents, itemAfter.startPosition);
    const afterLine = returnLineNumberPosition(
      contents,
      itemAfter.startPosition
    );

    const leadingWhitespace = startsWithWhitespace(line) || '';

    const insert = pad(newItem, leadingWhitespace + '  ')
      .withLeading(`${leadingWhitespace}- `)
      .flush();

    return insertLines(contents, afterLine - 1, insert);
  } else if (isAddingLastItem) {
    const itemBefore = parentAst.items[index - 1];
    const line = returnLineForPosition(contents, itemBefore.startPosition);
    const leadingWhitespace = startsWithWhitespace(line) || '';

    const insert = pad(newItem, leadingWhitespace + '  ')
      .withLeading(EOL + leadingWhitespace + '- ')
      .flush();

    return replaceRange(
      contents,
      parentAst.endPosition - 1,
      parentAst.endPosition - 1,
      insert
    );
  } else {
    const itemBefore = parentAst.items[index - 1];
    const line = returnLineForPosition(contents, itemBefore.startPosition);

    const beforeLine = returnLineNumberPosition(
      contents,
      itemBefore.startPosition
    );

    const leadingWhitespace = startsWithWhitespace(line) || '';

    const insert = pad(newItem, leadingWhitespace + '  ')
      .withLeading(leadingWhitespace + '- ')
      .flush();

    return insertLines(contents, beforeLine + 1, insert);
  }
}

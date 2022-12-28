import YAML from 'yaml';
import { Operation } from 'fast-json-patch';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { YAMLSequence } from 'yaml-ast-parser';

export function applyOperationsToYamlString(
  yamlFileContent: string,
  operations: Operation[]
): string {
  const doc = YAML.parseDocument(yamlFileContent);
  operations.forEach((operation) => {
    const path = jsonPointerHelpers.decode(operation.path);

    switch (operation.op) {
      case 'add': {
        const node = doc.createNode(operation.value);
        const collectionPath = [...path];
        const lastPathItem = collectionPath.pop();

        // we are adding to an array collection
        if (!isNaN(Number(lastPathItem)) || lastPathItem === '-') {
          const arrayCollection = doc.getIn(collectionPath) as YAMLSequence;

          const lastIndex = Number(lastPathItem);

          arrayCollection.items = insert(
            arrayCollection.items,
            !isNaN(lastIndex) ? lastIndex : arrayCollection.items.length,
            node
          );

          // we are adding to an map collection
        } else {
          doc.addIn(collectionPath, {
            key: lastPathItem,
            value: node,
          });
        }
        break;
      }
      case 'remove': {
        doc.deleteIn(path);
        break;
      }
      case 'replace':
        doc.setIn(path, operation.value);
        break;
      default:
        throw new Error(
          'unsupported json patch operation ' + JSON.stringify(operation)
        );
    }
  });

  return doc.toString();
}

function insert<T>(arr: T[], index: number, item: any) {
  const copy = [...arr];
  copy.splice(index, 0, item);
  return copy;
}

function remove<T>(arr: T[], index: number) {
  const copy = [...arr];
  copy.splice(index, 1);
  return copy;
}

import { makeSpectacle } from './index';
import * as OpticEngine from '@useoptic/optic-engine-wasm';
import { InMemoryOpticContextBuilder } from './in-memory';

import * as fs from 'fs';

function loadExampleSpec(name: string): any[] {
  return JSON.parse(
    fs
      .readFileSync(`./workspaces/spectacle/examples/${name}.json`)
      .toString('utf-8')
  );
}

// TODO: replace examples with snapshot tests
const _events = loadExampleSpec('array-changes');

async function main() {
  const opticContext = await InMemoryOpticContextBuilder.fromEvents(
    OpticEngine,
    _events
  );
  const spectacle = await makeSpectacle(opticContext);

  const batchCommitResults = await spectacle.queryWrapper({
    query: `{
      batchCommits {
        createdAt
        batchId
      }
    }`,
    variables: {},
  });

  // console.log(JSON.stringify(batchCommitResults, null, 2));

  const endpointChangesResult = await spectacle.queryWrapper({
    query: `{
      endpointChanges(sinceBatchCommitId: "645a4137-d59d-4d9f-a474-d2bca67ba1cc") {
        endpoints {
          change {
            category
          }
          path
          method
        }
      }
    }`,
    variables: {},
  });

  console.log(JSON.stringify(endpointChangesResult, null, 2));

  const result = await spectacle.queryWrapper({
    query: `{
      requests {
        id
        pathId
        absolutePathPattern
        method
        bodies {
          contentType
          rootShapeId
        }
        responses {
          id
          statusCode
          bodies {
            contentType
            rootShapeId
          }
        }
      }
    }`,
    variables: {},
  });

  console.log(JSON.stringify(result, null, 2));

  {
    // array shape_Dw5kY43tt1
    // object shape_jSAthS01Bb
    const result = await spectacle.queryWrapper({
      query: `{
        shapeChoices(shapeId: "shape_jSAthS01Bb") {
          id
          jsonType
          asArray {
            changes(sinceBatchCommitId: "645a4137-d59d-4d9f-a474-d2bca67ba1cc") {
              added
              changed
            }
          }
          asObject {
            fields {
              shapeId
              fieldId
              name
              changes(sinceBatchCommitId: "645a4137-d59d-4d9f-a474-d2bca67ba1cc") {
                added
                changed
              }
            }
          }
        }
      }`,
      variables: {},
    });
    console.log(JSON.stringify(result, null, 2));
  }
}

main();

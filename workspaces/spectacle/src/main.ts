import { makeSpectacle } from './index';
import * as OpticEngine from '@useoptic/diff-engine-wasm/engine/build';
import { InMemoryOpticContextBuilder } from './in-memory';

import * as fs from 'fs';

function loadExampleSpec(name: string): any[] {
  return JSON.parse(
    fs
      .readFileSync(`./workspaces/spectacle/examples/${name}.json`)
      .toString('utf-8'),
  );
}

// TODO: replace examples with snapshot tests
const _events = loadExampleSpec('make-optional');

async function main() {
  const opticContext = await InMemoryOpticContextBuilder.fromEvents(
    OpticEngine,
    _events,
  );
  const spectacle = await makeSpectacle(opticContext);

  const batchCommitResults = await spectacle({
    query: `{
      batchCommits {
        createdAt
        batchId
      }
    }`,
    variables: {},
  });

  // console.log(JSON.stringify(batchCommitResults, null, 2));

  const endpointChangesResult = await spectacle({
    query: `{
      endpointChanges(since: "2021-02-23T20:09:41.006Z") {
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

  const result = await spectacle({
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
    const result = await spectacle({
      query: `{
        shapeChoices(shapeId: "shape_9EcKj9sZHD") {
          id
          jsonType
          changes {
            added
            changed
          }
          asObject {
            fields {
              shapeId
              fieldId
              name
              changes(sinceBatchCommitId: "f5e550ad-8890-4545-af44-c49081c9ec62") {
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

import { makeSpectacle } from './index';
import * as DiffEngine from '@useoptic/diff-engine-wasm/engine/build';

import * as fs from 'fs';

function loadExampleSpec(name: string): any[] {
  return JSON.parse(
    fs.readFileSync(`./workspaces/spectacle/examples/${name}.json`)
      .toString('utf-8'))
}

// TODO: replace examples with snapshot tests
const _events = loadExampleSpec('add-req-body-field');

async function main() {
  const spectacle = await makeSpectacle(DiffEngine, {
    specRepository: {
      listEvents(): Promise<any[]> {
        return Promise.resolve(_events);
      }
    }
  });

  const batchCommitResults = await spectacle({
    query: `{
  batchCommits {
    createdAt
    batchId
  }
}`,
    variables: {}
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
    variables: {}
  });

  console.log(JSON.stringify(endpointChangesResult, null, 2));

  return;

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
    variables: {}
  });

  console.log(JSON.stringify(result, null, 2));

  {
    const result = await spectacle({
      query: `{ 
    shapeChoices(shapeId: "shape_RvMMDY4eOD") {
      id
      jsonType
    }
}`,
      variables: {}
    });
    console.log(JSON.stringify(result, null, 2));

  }
}

main();
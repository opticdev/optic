import {
  JsonHelper,
  mapScala,
  opticEngine,
  ScalaJSHelpers,
} from '@useoptic/domain';
import { IHttpInteraction } from '@useoptic/domain-types';

const LearnAPIHelper = opticEngine.com.useoptic.diff.interactions.interpreters.LearnAPIHelper();

export function localInitialBodyLearner(
  rfcState: any,
  pathId: string,
  method: string,
  interactions: any[]
): ILearnedBodies {
  const undocumentedUrlHelpers = new opticEngine.com.useoptic.diff.helpers.UndocumentedUrlIncrementalHelpers(
    rfcState
  );

  const shapeBuilderMap = LearnAPIHelper.newShapeBuilderMap(pathId, method);

  function filterByEndpoint(endpoint: { pathId: string; method: string }) {
    return function (interaction: IHttpInteraction) {
      const pathId = ScalaJSHelpers.getOrUndefined(
        undocumentedUrlHelpers.tryResolvePathId(interaction.request.path)
      );
      return (
        endpoint.method === interaction.request.method &&
        endpoint.pathId === pathId
      );
    };
  }

  const filter = filterByEndpoint({ pathId, method });

  interactions.forEach((i) => {
    const deserializedInteraction = JsonHelper.fromInteraction(i);
    if (filter(i)) {
      console.log('learning');
      // only learn if it matches the endpoint
      LearnAPIHelper.learnBody(deserializedInteraction, shapeBuilderMap);
    } else {
      console.log('skipping');
    }
  });

  mapScala(shapeBuilderMap.requestRegions)((request: any) =>
    console.log(request)
  );
  mapScala(shapeBuilderMap.requestRegions)((response: any) =>
    console.log(response)
  );

  return {
    pathId,
    method,
    requests: [],
    responses: [],
  };
}

export interface ILearnedBodies {
  pathId: string;
  method: string;
  requests: ILearnedBody[];
  responses: ILearnedBody[];
}

export interface ILearnedBody {
  contentType: string;
  statusCode?: number;
  commands: any[];
  rootShapeId: string;
}

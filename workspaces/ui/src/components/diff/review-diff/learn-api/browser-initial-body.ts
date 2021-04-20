import {
  getOrUndefined,
  JsonHelper,
  mapScala,
  opticEngine,
  ScalaJSHelpers,
} from '@useoptic/domain';
import { IHttpInteraction } from '@useoptic/domain-types';
import { ILearnedBodies } from '@useoptic/cli-shared/build/diffs/initial-types';

const LearnAPIHelper = opticEngine.com.useoptic.diff.interactions.interpreters.LearnAPIHelper();

export function localInitialBodyLearner(
  rfcState: any,
  pathId: string,
  method: string,
  interactions: any[],
  domainIds: any,
): ILearnedBodies {
  const undocumentedUrlHelpers = new opticEngine.com.useoptic.diff.helpers.UndocumentedUrlIncrementalHelpers(
    rfcState,
  );

  const shapeBuilderMap = LearnAPIHelper.newShapeBuilderMap(
    pathId,
    method,
    domainIds,
  );

  function filterByEndpoint(endpoint: { pathId: string; method: string }) {
    return function (interaction: IHttpInteraction) {
      const pathId = ScalaJSHelpers.getOrUndefined(
        undocumentedUrlHelpers.tryResolvePathId(interaction.request.path),
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
      // only learn if it matches the endpoint
      LearnAPIHelper.learnBody(deserializedInteraction, shapeBuilderMap);
    }
  });

  return {
    pathId,
    method,
    requests: mapScala(shapeBuilderMap.requestRegions)((request: any) => ({
      contentType: getOrUndefined(request.contentType),
      commands: opticEngine.CommandSerialization.toJs(request.commands),
      rootShapeId: request.rootShapeId,
    })),
    responses: mapScala(shapeBuilderMap.responseRegions)((response: any) => ({
      contentType: getOrUndefined(response.contentType),
      statusCode: response.statusCode,
      commands: opticEngine.CommandSerialization.toJs(response.commands),
      rootShapeId: response.rootShapeId,
    })),
  };
}

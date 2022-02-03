import { ApiTraffic } from './types';
import { ConceptualLocation } from '@useoptic/openapi-utilities';
import invariant from 'ts-invariant';

export function trafficSelector(traffic: ApiTraffic) {
  return {
    bodyJsonForLocation: (location: ConceptualLocation) => {
      if ('inResponse' in location && 'body' in location.inResponse) {
        const contentType = location.inResponse.body.contentType;

        invariant(
          contentType === traffic.response.body.contentType,
          'content type must match when selecting examples from traffic'
        );

        invariant(
          typeof traffic.response.body.jsonBodyString !== 'undefined',
          'body json must be present if selecting example from traffic'
        );

        return JSON.parse(traffic.response.body.jsonBodyString!);
      }

      if ('inRequest' in location && 'body' in location.inRequest) {
        const { contentType } = location.inRequest.body;
        invariant(
          contentType === traffic.requestBody?.contentType,
          'content type must match when selecting examples from traffic'
        );
        invariant(
          typeof traffic.requestBody.jsonBodyString !== 'undefined',
          'body json must be present if selecting example from traffic'
        );
        return JSON.parse(traffic.requestBody.jsonBodyString!);
      }

      invariant(false, 'can not select example body from traffic');
    },
  };
}

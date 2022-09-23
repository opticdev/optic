import {
  OperationRule,
  RequestRule,
  ResponseBody,
  ResponseRule,
  RuleError,
} from '@useoptic/rulesets-base';
import { appliesWhen } from './constants';
import { OpenAPIV3 } from 'openapi-types';

export const requireResponseExamples = (applies: typeof appliesWhen[number]) =>
  new ResponseRule({
    name: 'require response body examples',
    rule: (responseAssertions) => {
      function responseToNumberOfExamples(body: ResponseBody) {
        const numberOfExamples =
          (body.raw.example ? 1 : 0) +
          Object.keys(body.raw.examples || {}).length;
        return numberOfExamples;
      }

      if (applies === 'always') {
        responseAssertions.requirement((value) => {
          value.bodies.forEach((body) => {
            if (responseToNumberOfExamples(body) < 1) {
              throw new RuleError({
                message: `a valid example is required for every documented response body`,
              });
            }
          });
        });
      }

      if (applies === 'addedOrChanged') {
        responseAssertions.addedOrChanged((value) => {
          value.bodies.forEach((body) => {
            if (responseToNumberOfExamples(body) < 1) {
              throw new RuleError({
                message: `a valid example is required for added response bodies`,
              });
            }
          });
        });
      }
    },
  });

export const requireRequestExamples = (applies: typeof appliesWhen[number]) =>
  new RequestRule({
    name: 'require request body examples',
    rule: (requestAssertions) => {
      function requestToNumberOfExamples(body: OpenAPIV3.MediaTypeObject) {
        const numberOfExamples =
          (body.example ? 1 : 0) + Object.keys(body.examples || {}).length;
        return numberOfExamples;
      }

      if (applies === 'always') {
        requestAssertions.body.requirement((value) => {
          const body = value.raw as unknown as OpenAPIV3.MediaTypeObject;

          if (requestToNumberOfExamples(body) < 1) {
            throw new RuleError({
              message: `a valid example is required for every documented request body`,
            });
          }
        });
      }

      if (applies === 'addedOrChanged') {
        requestAssertions.body.addedOrChanged((value) => {
          const body = value.raw as unknown as OpenAPIV3.MediaTypeObject;

          if (requestToNumberOfExamples(body) < 1) {
            throw new RuleError({
              message: `a valid example is required for added request bodies`,
            });
          }
        });
      }
    },
  });

export const requireParameterExamples = (applies: typeof appliesWhen[number]) =>
  new OperationRule({
    name: 'require parameter examples',
    rule: (operation) => {
      if (applies === 'always') {
        operation.headerParameter.requirement((header) => {
          if (!header.raw.example) {
            throw new RuleError({
              message: `a valid example is required for every documented header`,
            });
          }
        });
        operation.queryParameter.requirement((header) => {
          if (!header.raw.example) {
            throw new RuleError({
              message: `a valid example is required for every documented query parameter`,
            });
          }
        });
        operation.cookieParameter.requirement((header) => {
          if (!header.raw.example) {
            throw new RuleError({
              message: `a valid example is required for every documented cookie parameter`,
            });
          }
        });
      }

      if (applies === 'addedOrChanged') {
        operation.headerParameter.addedOrChanged((header) => {
          if (!header.raw.example) {
            throw new RuleError({
              message: `a valid example is required for added header`,
            });
          }
        });
        operation.queryParameter.addedOrChanged((header) => {
          if (!header.raw.example) {
            throw new RuleError({
              message: `a valid example is required for added query parameter`,
            });
          }
        });
        operation.cookieParameter.addedOrChanged((header) => {
          if (!header.raw.example) {
            throw new RuleError({
              message: `a valid example is required for added cookie parameter`,
            });
          }
        });
      }
    },
  });

import {
  OperationRule,
  RequestRule,
  ResponseBody,
  ResponseBodyRule,
  ResponseRule,
  RuleError,
} from '@useoptic/rulesets-base';
import { appliesWhen } from './constants';
import { OpenAPIV3 } from 'openapi-types';
import { qualifiedContentType } from './qualifiedContentType';

export const requireResponseExamples = (applies: typeof appliesWhen[number]) =>
  new ResponseBodyRule({
    name: 'require response body examples',
    matches: (body) => qualifiedContentType(body.contentType),
    rule: (responseBodyAssertions) => {
      function responseToNumberOfExamples(body: ResponseBody) {
        const numberOfExamples =
          (body.raw.example ? 1 : 0) +
          Object.keys(body.raw.examples || {}).length;
        return numberOfExamples;
      }

      if (applies === 'always') {
        responseBodyAssertions.body.requirement((body) => {
          if (responseToNumberOfExamples(body) < 1) {
            throw new RuleError({
              message: `a valid example is required for every documented response body`,
            });
          }
        });
      }

      if (applies === 'addedOrChanged') {
        responseBodyAssertions.body.addedOrChanged((body) => {
          if (responseToNumberOfExamples(body) < 1) {
            throw new RuleError({
              message: `a valid example is required for added response bodies`,
            });
          }
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
          if (!qualifiedContentType(value.contentType)) return;

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

          if (!qualifiedContentType(value.contentType)) return;

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
      const lifecycle = applies === 'always' ? 'requirement' : 'addedOrChanged';
      const errorMessageType = applies === 'always' ? 'every' : 'added';

      function schemaHasExample(
        schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject | undefined
      ) {
        if (schema) {
          if ('example' in schema) {
            return typeof schema.example !== 'undefined';
          }
        }
        return false;
      }

      operation.headerParameter[lifecycle]((header) => {
        if (!header.raw.example && !schemaHasExample(header.raw.schema)) {
          throw new RuleError({
            message: `a valid example is required for ${errorMessageType} header`,
          });
        }
      });
      operation.queryParameter[lifecycle]((header) => {
        if (!header.raw.example && !schemaHasExample(header.raw.schema)) {
          throw new RuleError({
            message: `a valid example is required for ${errorMessageType} query parameter`,
          });
        }
      });
      operation.cookieParameter[lifecycle]((header) => {
        if (!header.raw.example && !schemaHasExample(header.raw.schema)) {
          throw new RuleError({
            message: `a valid example is required for ${errorMessageType} cookie parameter`,
          });
        }
      });
    },
  });

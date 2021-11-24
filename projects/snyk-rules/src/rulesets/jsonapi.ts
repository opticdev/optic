import { SnykApiCheckDsl } from "../dsl";
import { OpenAPIV3 } from "openapi-types";
import { spec } from "@useoptic/api-checks/build/sdk/test/select-when-rule.test";

const { expect } = require("chai");

export const rules = {
  statusCodes: ({ operations }: SnykApiCheckDsl) => {
    operations.requirement.must(
      "support the correct status codes",
      (operation, context, docs, specItem) => {
        if (operation.pathPattern.match(/\/openapi/)) return;

        const statusCodes = Object.keys(specItem.responses);

        // Ensure only supported 4xx are used
        const allowed4xxStatusCodes = [
          "400",
          "401",
          "403",
          "404",
          "409",
          "429",
        ];
        const statusCodes4xx = statusCodes.filter((statusCode) =>
          statusCode.startsWith("4")
        );
        for (const statusCode4xx of statusCodes4xx) {
          expect(allowed4xxStatusCodes).to.include(statusCode4xx);
        }

        // Ensure delete supports correct 2xx status codes
        if (operation.method === "delete") {
          const statusCodes2xx = statusCodes.filter((statusCode) =>
            statusCode.startsWith("2")
          );
          for (const statusCode2xx of statusCodes2xx) {
            expect(["200", "204"]).to.include(statusCode2xx);
          }
        }

        // Ensure delete supports correct 2xx status codes
        if (operation.method === "post") {
          const statusCodes2xx = statusCodes.filter((statusCode) =>
            statusCode.startsWith("2")
          );
          for (const statusCode2xx of statusCodes2xx) {
            expect(["201"]).to.include(statusCode2xx);
          }
        }
      }
    );
  },
  contentType: ({ responses }: SnykApiCheckDsl) => {
    responses.requirement.must(
      "use the JSON:API content type",
      (response, context, docs, specItem) => {
        if (response.statusCode === 204) return;
        const contentTypes = Object.keys(specItem.content);
        expect(contentTypes).to.include("application/vnd.api+json");
      }
    );
  },
  responseData: ({ responses }: SnykApiCheckDsl) => {
    responses.requirement.must(
      "use the correct JSON:API response data",
      (response, context, docs, specItem) => {
        // Patch response requires schema
        if (context.method === "patch" && response.statusCode === 200) {
          expect(
            specItem.content["application/vnd.api+json"]?.schema?.properties,
            `expected response ${context.path} ${context.method} ${response.statusCode} to have a schema`
          ).to.exist;
        }

        // Empty patch 204 content
        if (
          ["delete", "patch"].includes(context.method) &&
          response.statusCode === 204
        ) {
          expect(
            specItem.content,
            `expected response ${context.path} ${context.method} ${response.statusCode} to not have content`
          ).to.not.exist;
        }

        // Non-204 status codes must have content
        if (response.statusCode !== 204) {
          expect(
            specItem.content,
            `expected response ${context.path} ${context.method} ${response.statusCode} to have content`
          ).to.not.exist;
        }

        // JSON:API data property
        if (
          ["get", "post"].includes(context.method) &&
          [200, 201].includes(response.statusCode)
        ) {
          expect(
            specItem.content["application/vnd.api+json"]?.schema?.properties
              ?.data?.type,
            `expected response ${context.path} ${context.method} ${response.statusCode} to have data property`
          ).to.exist;
        }

        // JSON:API jsonapi property
        if (
          !["patch", "delete"].includes(context.method) &&
          [200, 201].includes(response.statusCode)
        ) {
          expect(
            specItem.content["application/vnd.api+json"]?.schema?.properties
              ?.jsonapi?.type?.data?.type,
            `expected response ${context.path} ${context.method} ${response.statusCode} to have a JSON:API property`
          ).to.exist;
        }

        // Success post responses
        if (context.method === "post" && response.statusCode === 201) {
          // Location header
          expect(
            specItem.headers,
            `expected response ${context.path} ${context.method} ${response.statusCode} to have a location header`
          ).to.have.property("location");
          // Self link
          expect(
            specItem.content["application/vnd.api+json"]?.schema?.properties
              ?.data?.properties?.links?.properties?.self,
            `expected response ${context.path} ${context.method} ${response.statusCode} to have a self link`
          ).to.exist;
        }
      }
    );
  },
  selfLinks: ({ responses }: SnykApiCheckDsl) => {
    responses.requirement.must(
      "include self links",
      (response, context, docs, specItem) => {
        // Top-level self links
        if (
          (["get", "patch"].includes(context.method) &&
            response.statusCode === 200) ||
          (context.method === "post" && response.statusCode === 200)
        ) {
          expect(
            specItem.content["application/vnd.api+json"]?.schema?.properties
              ?.links?.properties?.self,
            `expected response ${context.path} ${context.method} ${response.statusCode} to have a self link`
          ).to.exist;
        }
      }
    );
  },
  pagination: ({ operations }: SnykApiCheckDsl) => {
    operations.requirement.must(
      "correctly support pagination",
      (operation, context, docs, specItem) => {
        if (operation.pathPattern.match(/\/openapi/)) return;

        const paginationParameters = [
          "starting_after",
          "ending_before",
          "limit",
        ];
        const parameterNames = (
          (specItem.parameters || []) as OpenAPIV3.ParameterObject[]
        ).map((parameter) => {
          return parameter.name;
        });
        if (operation.pathPattern.match(/\{[a-z]*?_?id\}$/)) {
          if (operation.method === "get") {
            // Require pagination parameters
            for (const paginationParameterName of paginationParameters) {
              expect(
                parameterNames,
                `expected ${operation.pathPattern} ${operation.method} to include ${paginationParameterName}`
              ).to.include(paginationParameterName);
            }
            // Require pagination links
            const response = specItem.responses["200"];
            if (!("$ref" in response)) {
              const schema = response.content?.["application/vnd.api+json"]?.schema || {};
              if (!("$ref" in schema)) {
                expect(schema.properties?.link).to.exist;
              }
            }
          }
        } else {
          if (operation.method !== "get") {
            for (const paginationParameterName of paginationParameters) {
              expect(
                parameterNames,
                `expected ${operation.pathPattern} ${operation.method} to not include ${paginationParameterName}`
              ).to.not.include(paginationParameterName);
            }
          }
        }
      }
    );
  },
  compoundDocuments: ({ responses }: SnykApiCheckDsl) => {
    responses.requirement.must(
      "not allow compound documents",
      (response, context, docs, specItem) => {
        if ([200, 201].includes(response.statusCode)) {
          expect(
            specItem.content["application/vnd.api+json"]?.schema?.properties
              ?.included,
            `expected response ${context.path} ${context.method} ${response.statusCode} to support compound documents`
          ).to.not.exist;
        }
      }
    );
  },
};

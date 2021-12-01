import { SnykApiCheckDsl } from '../dsl';
import { expect } from 'chai';
import { pascalCase } from 'change-case';

export const rules = {
  componentNameCase: ({ specification }: SnykApiCheckDsl) => {
    specification.requirement.must(
      'use pascal case for component names',
      (spec) => {
        const componentTypes = Object.keys(spec.components || {});
        for (const componentType of componentTypes) {
          const componentNames = Object.keys(
            spec.components?.[componentType] || {}
          );
          for (const componentName of componentNames) {
            expect(pascalCase(componentName)).to.equal(componentName);
          }
        }
      }
    );
  },
  listOpenApiVersions: ({ specification }: SnykApiCheckDsl) => {
    specification.requirement.must(
      'list the available versioned OpenAPI specifications',
      (spec) => {
        const pathUrls = Object.keys(spec.paths);
        expect(pathUrls).to.include('/openapi');
      }
    );
  },
  getOpenApiVersions: ({ specification }: SnykApiCheckDsl) => {
    specification.requirement.must(
      'provide versioned OpenAPI specifications',
      (spec) => {
        const pathUrls = Object.keys(spec.paths);
        expect(pathUrls).to.include('/openapi/{version}');
      }
    );
  },
  orgOrGroupTenant: ({ specification }: SnykApiCheckDsl) => {
    specification.requirement.must('have an org or group tenant', (spec) => {
      const tenantUrls = Object.keys(spec.paths).filter(
        (url) => url === '/orgs/{org_id}' || url === '/groups/{group_id}'
      );
      expect(tenantUrls).to.have.lengthOf.at.least(0);
    });
  },
  tags: ({ specification }: SnykApiCheckDsl) => {
    specification.requirement.must(
      'have name and description for tags',
      (spec) => {
        const tags = spec.tags || [];
        for (const tag of tags) {
          expect(tag).to.have.property('name');
          expect(tag).to.have.property('description');
        }
      }
    );
  },
};

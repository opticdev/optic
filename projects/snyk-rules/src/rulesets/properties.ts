import { SnykApiCheckDsl } from "../dsl";
const { expect } = require("chai");
export const rules = {
  propertyKey: ({ bodyProperties }: SnykApiCheckDsl) => {
    bodyProperties.requirement.must("have camel case keys", ({ key }) => {
      const snakeCase = /^[a-z]+(?:_[a-z]+)*$/g;
      expect(snakeCase.test(key)).to.be.ok;
    });
  },
  propertyExample: ({ bodyProperties }: SnykApiCheckDsl) => {
    bodyProperties.requirement.must("have an example", ({ flatSchema }) => {
      expect(flatSchema.example).to.exist;
    });
  },
  propertyFormat: ({ bodyProperties }: SnykApiCheckDsl) => {
    bodyProperties.requirement.should(
      "have a format when a string",
      ({ flatSchema }) => {
        if (flatSchema.type === "string") {
          expect(flatSchema.format).to.exist;
        }
      }
    );
  },
  preventRemoval: ({ bodyProperties }: SnykApiCheckDsl) => {
    bodyProperties.removed.must("not be removed", (property) => {
      expect(false, `expected ${property.key} to be present`).to.be.ok;
    });
  },
  preventAddingRequiredRequestProperties: ({
    bodyProperties,
  }: SnykApiCheckDsl) => {
    bodyProperties.added.must("not be required", (property, context) => {
      if (!context.inRequest) return;
      expect(property.required).to.not.be.true;
    });
  },
  enumOrExample: ({ bodyProperties }: SnykApiCheckDsl) => {
    bodyProperties.requirement.must(
      "have enum or example",
      (property, context) => {
        if (!context.inResponse) return;
        if (
          property.flatSchema.type === "object" ||
          property.flatSchema.type === "boolean"
        )
          return;
        expect(Boolean(property.flatSchema.enum || property.flatSchema.example))
          .to.be.true;
      }
    );
  },
  dateFormatting: ({ bodyProperties, operations }: SnykApiCheckDsl) => {
    bodyProperties.requirement.must(
      "use date-time for dates",
      (property, context) => {
        if (!context.inResponse) return;
        if (["created", "updated", "deleted"].includes(property.key)) {
          expect(property.flatSchema.format).to.be("date-time");
        }
      }
    );
  },
  arrayWithItems: ({ bodyProperties, operations }: SnykApiCheckDsl) => {
    bodyProperties.requirement.must(
      "have type for array items",
      (property, context) => {
        if (property.flatSchema.type === "array") {
          expect(property.flatSchema.items).to.have.property("type");
        }
      }
    );
  },
};

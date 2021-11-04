import { render } from "ink-testing-library";
import React from "react";
import { RenderCheckResults } from "../render-results";
import { Result } from "../../../sdk/types";

describe("list of checks", () => {
  it("renders empty list of checks", async () => {
    const { lastFrame } = render(<RenderCheckResults results={results} />);
    // console.log(lastFrame());
    // jest complains for some reason, and the snapshots aren't consistent.
    expect(lastFrame()).toMatchSnapshot();
  });
});

const results = [
  {
    passed: false,
    condition: "have tags",
    where: "operation",
    isMust: true,
    isShould: false,
    docsLink:
      "https://github.com/snyk/sweater-comb/blob/main/docs/standards.md#tags",
    error: "tags [] must be set on each operation: expected undefined to exist",
    change: {
      location: {
        jsonPath: ["paths", "/example", "get"],
        conceptualPath: ["operations", "/example", "get"],
        kind: "operation",
        conceptualLocation: { method: "get", path: "/example" },
      },
      value: {
        operationId: "",
        summary: "Retrieve example",
        method: "get",
        pathPattern: "/example",
      },
    },
  },
  {
    passed: false,
    condition: "have an operation id",
    where: "operation",
    isMust: true,
    isShould: false,
    error: "operation id is missing",
    docsLink:
      "https://github.com/snyk/sweater-comb/blob/main/docs/standards.md#operation-ids",
    change: {
      location: {
        jsonPath: ["paths", "/example", "get"],
        conceptualPath: ["operations", "/example", "get"],
        kind: "operation",
        conceptualLocation: { method: "get", path: "/example" },
      },
      value: {
        operationId: "",
        summary: "Retrieve example",
        method: "get",
        pathPattern: "/example",
      },
    },
  },
  {
    passed: true,
    condition: "have an operation id",
    where: "operation",
    isMust: true,
    isShould: false,
    error: "operation id is missing",
    docsLink:
      "https://github.com/snyk/sweater-comb/blob/main/docs/standards.md#operation-ids",
    change: {
      location: {
        jsonPath: ["paths", "/example", "get"],
        conceptualPath: ["operations", "/example", "get"],
        kind: "operation",
        conceptualLocation: { method: "patch", path: "/example/{}" },
      },
      value: {
        operationId: "",
        summary: "Retrieve example",
        method: "patch",
        pathPattern: "/example/:exampleId",
      },
    },
  },
];

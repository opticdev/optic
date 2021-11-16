import { ApiCheckDsl, EntityRule, Result } from "../types";
import { genericEntityRuleImpl } from "../generic-entity-rule-impl";
import { OpenAPIV3 } from "openapi-types";
import {
  IChange,
  IFact,
  OpenApiKind,
  OpenApiOperationFact,
  OpenApiFact,
} from "@useoptic/openapi-utilities";
import { jsonPointerHelpers } from "@useoptic/common";

export type ExampleDslContext = {
  maturity: "wip" | "beta" | "ga";
};

export class ExampleDsl implements ApiCheckDsl {
  private checks: Promise<Result>[] = [];

  constructor(
    private nextFacts: IFact<OpenApiFact>[],
    private nextJson: OpenAPIV3.Document,
    private changelog: IChange<OpenApiFact>[]
  ) {}

  getContext(): ExampleDslContext {
    return {
      maturity: "wip",
    };
  }

  get operations(): EntityRule<
    OpenApiOperationFact,
    {},
    ExampleDslContext,
    OpenAPIV3.OperationObject
  > {
    return genericEntityRuleImpl<
      OpenApiOperationFact,
      {},
      ExampleDslContext,
      OpenAPIV3.OperationObject
    >(
      OpenApiKind.Operation,
      this.changelog,
      this.nextFacts,
      (opFact) => `${opFact.method.toUpperCase()} ${opFact.pathPattern}`,
      (location) => this.getContext(),
      (...items) => this.checks.push(...items),
      (pointer: string) => jsonPointerHelpers.get(this.nextJson, pointer)
    );
  }

  checkPromises() {
    return this.checks;
  }
}

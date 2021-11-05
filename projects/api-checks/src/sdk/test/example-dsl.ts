import {
  IChange,
  IFact,
} from "@useoptic/openapi-utilities/build/openapi3/sdk/types";
import { ApiCheckDsl, EntityRule, Result } from "../types";
import { OpenApiKind, OpenApiOperationFact } from "@useoptic/openapi-utilities";
import { genericEntityRuleImpl } from "../generic-entity-rule-impl";

export type ExampleDslContext = {
  maturity: "wip" | "beta" | "ga";
};

export class ExampleDsl implements ApiCheckDsl {
  private checks: Promise<Result>[] = [];

  constructor(
    private nextFacts: IFact<any>[],
    private changelog: IChange<any>[]
  ) {}

  getContext(): ExampleDslContext {
    return {
      maturity: "wip",
    };
  }

  get operations(): EntityRule<OpenApiOperationFact, {}, ExampleDslContext> {
    return genericEntityRuleImpl<OpenApiOperationFact, {}, ExampleDslContext>(
      OpenApiKind.Operation,
      this.changelog,
      this.nextFacts,
      (opFact) => `${opFact.method.toUpperCase()} ${opFact.pathPattern}`,
      (location) => this.getContext(),
      (...items) => this.checks.push(...items)
    );
  }

  checkPromises() {
    return this.checks;
  }
}

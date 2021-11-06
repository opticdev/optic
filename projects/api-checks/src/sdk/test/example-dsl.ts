import {
  IChange,
  IFact,
} from "@useoptic/openapi-utilities/build/openapi3/sdk/types";
import { ApiCheckDsl, EntityRule, Result } from "../types";
import {
  jsonPointerHelper,
  OpenApiKind,
  OpenApiOperationFact,
} from "@useoptic/openapi-utilities";
import { genericEntityRuleImpl } from "../generic-entity-rule-impl";
import { OpenAPIV3 } from "openapi-types";

export type ExampleDslContext = {
  maturity: "wip" | "beta" | "ga";
};

export class ExampleDsl implements ApiCheckDsl {
  private checks: Promise<Result>[] = [];

  constructor(
    private nextFacts: IFact<any>[],
    private nextJson: OpenAPIV3.Document,
    private changelog: IChange<any>[]
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
      (pointer: string) => jsonPointerHelper.get(this.nextJson, pointer)
    );
  }

  checkPromises() {
    return this.checks;
  }
}

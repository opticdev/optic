import { ApiCheckDsl, Result } from "./types";
import express, { Express } from "express";
import bodyParser from "body-parser";
import { OpenAPIV3 } from "openapi-types";
import flatten from "lodash.flatten";
import {
  factsToChangelog,
  OpenAPITraverser,
} from "@useoptic/openapi-utilities";
import * as http from "http";
import {
  IChange,
  IFact,
} from "@useoptic/openapi-utilities/build/openapi3/sdk/types";

export type DslConstructorInput<Context> = {
  context: Context;
  nextFacts: IFact<any>[];
  currentFacts: IFact<any>[];
  changelog: IChange<any>[];
};

export class ApiCheckService<Context> {
  private app: Express | undefined;
  private server: http.Server | undefined;

  private rules: ((
    input: DslConstructorInput<Context>
  ) => Promise<Result>[])[] = [];

  useDsl<DSL extends ApiCheckDsl>(
    dslConstructor: (input: DslConstructorInput<Context>) => DSL,
    ...rules: ((dsl: DSL) => void)[]
  ) {
    const runner = (input: DslConstructorInput<Context>) => {
      const dsl = dslConstructor(input);
      rules.forEach((i) => i(dsl));
      return dsl.checkPromises();
    };

    this.rules.push(runner);
    return this;
  }

  async runRules(
    currentJsonLike: OpenAPIV3.Document,
    nextJsonLike: OpenAPIV3.Document,
    context: Context
  ) {
    const currentTraverser = new OpenAPITraverser();
    const nextTraverser = new OpenAPITraverser();

    await currentTraverser.traverse(currentJsonLike);
    const currentFacts = currentTraverser.accumulator.allFacts();
    await nextTraverser.traverse(nextJsonLike);
    const nextFacts = nextTraverser.accumulator.allFacts();

    const input: DslConstructorInput<Context> = {
      currentFacts,
      nextFacts,
      changelog: factsToChangelog(currentFacts, nextFacts),
      context,
    };

    const checkPromises: Promise<Result>[] = flatten(
      this.rules.map((ruleRunner) => ruleRunner(input))
    );

    const results: Result[] = await Promise.all(checkPromises);

    return results;
  }

  // service
  async start(port: number) {
    this.app = express();
    this.app.use(bodyParser.json({ limit: "20mb" }));
    this.app.post("/openapi/v3/checks", async (req, res) => {
      const { currentJsonLike, nextJsonLike, context } =
        req.body as ApiCheckServiceRequestBody<Context>;

      const results = await this.runRules(
        currentJsonLike,
        nextJsonLike,
        context
      );
      // const results: Result[][] = await Promise.all(
      //   dsls.map(async (dsl) =>
      //     dsl.run(nextTraverser.accumulator.allFacts(), changelog)
      //   )
      // );
      res.json({ checkResults: results });
    });

    this.server = this.app.listen(port, () => {
      console.log("Running api-check service on port " + port);
    });
  }

  stop() {
    if (this.app && this.server) {
      this.server.close(() => {
        this.app = undefined;
        this.server = undefined;
        console.log("shut down api-check service");
      });
    }
  }
}

export interface ApiCheckServiceRequestBody<Context> {
  currentJsonLike: OpenAPIV3.Document;
  nextJsonLike: OpenAPIV3.Document;
  gitContext: {};
  context: Context;
}

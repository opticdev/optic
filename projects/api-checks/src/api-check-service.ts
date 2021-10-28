import { ApiCheckDsl, Result } from "./types";
import express from "express";
import bodyParser from "body-parser";
import { OpenAPIV3 } from "openapi-types";
import flatten from "lodash.flatten";
import {
  factsToChangelog,
  OpenAPITraverser,
} from "@useoptic/openapi-utilities";

export function createApiCheckService(port: number): ApiCheckService {
  const app = express();
  const dsls: ApiCheckDsl[] = [];

  app.use(bodyParser.json({ limit: "10mb" }));
  app.post("/openapi/v3/checks", async (req, res) => {
    const { currentJsonLike, nextJsonLike } =
      req.body as ApiCheckServiceRequestBody;

    const currentTraverser = new OpenAPITraverser();
    const nextTraverser = new OpenAPITraverser();

    await currentTraverser.traverse(currentJsonLike);
    await nextTraverser.traverse(nextJsonLike);

    const changelog = factsToChangelog(
      currentTraverser.accumulator.allFacts(),
      nextTraverser.accumulator.allFacts()
    );

    const results: Result[][] = await Promise.all(
      dsls.map(async (dsl) =>
        dsl.run(nextTraverser.accumulator.allFacts(), changelog)
      )
    );
    res.json({ checkResults: flatten(results) });
  });

  app.listen(port, () => {
    console.log("Running api-check service on port " + port);
  });

  return {
    useDsl: (dsl) => {
      dsls.push(dsl);
      return dsl;
    },
  };
}

interface ApiCheckService {
  useDsl: <T extends ApiCheckDsl>(dsl: T) => T;
}

export interface ApiCheckServiceRequestBody {
  currentJsonLike: OpenAPIV3.Document;
  nextJsonLike: OpenAPIV3.Document;
  gitContext: {};
}

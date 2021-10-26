import React from "react";
import { program as cli } from "commander";
import { Compare } from "./commands/compare";
import { parseSpecVersion } from "./input-helpers/compare-input-parser";
import { OpenAPIV3 } from "@useoptic/openapi-utilities";
import { defaultEmptySpec } from "./constants";
const packageJson = require("../package.json");
import { render } from "ink";

cli.version(packageJson.version);

const compareCommand = cli
  .command("compare")
  .requiredOption("--from <from>", "from file or rev:file")
  .option("--to <to>", "to file or rev:file, defaults empty spec")
  .requiredOption("--rules <spec>", "rules service URL")
  .action(async (options: { from: string; to?: string; rules: string }) => {
    // ompare(
    //   parseSpecVersion(options.from, defaultEmptySpec),
    //   parseSpecVersion(options.to, defaultEmptySpec),
    //   options.rules
    // );

    render(<Compare />);
  });

cli.parse(process.argv);

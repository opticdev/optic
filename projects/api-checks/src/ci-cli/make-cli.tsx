import React from "react";
import { program as cli } from "commander";
import { Compare } from "./commands/compare";
import { parseSpecVersion } from "./input-helpers/compare-input-parser";
import { defaultEmptySpec } from "./constants";
const packageJson = require("../../package.json");
import { render } from "ink";
import { ApiCheckService } from "../sdk/api-check-service";

export function makeCiCli<T>(
  forProject: string,
  checkService: ApiCheckService<T>
) {
  cli.version(
    `for ${forProject}, running optic api-check ${packageJson.version}`
  );

  const compareCommand = cli
    .command("compare")
    .requiredOption("--from <from>", "from file or rev:file")
    .option("--to <to>", "to file or rev:file, defaults empty spec")
    .requiredOption("--rules <spec>", "rules service URL")
    .action(async (options: { from: string; to?: string; rules: string }) => {
      const { waitUntilExit } = render(
        <Compare
          from={parseSpecVersion(options.from, defaultEmptySpec)}
          to={parseSpecVersion(options.to, defaultEmptySpec)}
          rules={options.rules}
        />,
        { exitOnCtrlC: true }
      );
      await waitUntilExit();
    });

  return cli;
}

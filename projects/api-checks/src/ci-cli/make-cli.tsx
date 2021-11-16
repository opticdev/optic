import React from "react";
import { program as cli } from "commander";
import { Compare } from "./commands/compare";
import { parseSpecVersion } from "./input-helpers/compare-input-parser";
import { defaultEmptySpec } from "./constants";
const packageJson = require("../../package.json");
import { render } from "ink";
import { ApiCheckService } from "../sdk/api-check-service";
import { registerUpload } from "./commands/upload";

export function makeCiCli<T>(
  forProject: string,
  checkService: ApiCheckService<T>,
  options: {
    opticToken?: string;
  } = {}
) {
  const { opticToken } = options;

  cli.version(
    `for ${forProject}, running optic api-check ${packageJson.version}`
  );

  cli
    .command("compare")
    .option("--from <from>", "from file or rev:file, defaults empty spec")
    .option("--to <to>", "to file or rev:file, defaults empty spec")
    .option("--context <context>", "json of context")
    .option("--verbose", "show all checks, even passing", false)
    .action(
      async (options: {
        from: string;
        to?: string;
        rules: string;
        context: T;
        verbose: boolean;
      }) => {
        const { waitUntilExit } = render(
          <Compare
            verbose={options.verbose}
            apiCheckService={checkService}
            from={parseSpecVersion(options.from, defaultEmptySpec)}
            to={parseSpecVersion(options.to, defaultEmptySpec)}
            context={options.context}
          />,
          { exitOnCtrlC: true }
        );
        await waitUntilExit();
      }
    );

  registerUpload(cli, { opticToken });

  return cli;
}

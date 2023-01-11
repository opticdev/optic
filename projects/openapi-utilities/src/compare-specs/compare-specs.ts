import { OpenAPIV3 } from 'openapi-types';
import { ObjectDiff, diff } from '../diff/diff';
import { RuleResult } from '../new-types';
const packageJson = require('../../package.json');

type SerializedSourcemap = {
  rootFilePath: string;
  files: Array<{
    path: string;
    index: number;
    contents: string;
    sha256: string;
  }>;

  refMappings: { [key: number]: string };
};

type InputSpec = {
  jsonLike: OpenAPIV3.Document;
  sourcemap: SerializedSourcemap;
  isEmptySpec: boolean;
};

type RuleRunner = {
  runRules: (inputs: {
    context: any;
    diffs: ObjectDiff[];
    fromSpec: OpenAPIV3.Document;
    toSpec: OpenAPIV3.Document;
  }) => Promise<RuleResult[]>;
};

export const compareSpecs = async (
  from: InputSpec,
  to: InputSpec,
  ruleRunner: RuleRunner
): Promise<{
  diffs: ObjectDiff[];
  results: RuleResult[];
  version: string;
}> => {
  const fromSpec = from.isEmptySpec ? {} : from.jsonLike;
  const toSpec = to.isEmptySpec ? {} : to.jsonLike;

  const diffs = diff(from, to);

  const results = await ruleRunner.runRules({
    context: {}, // TODO
    diffs,
    fromSpec: fromSpec as any, // TODO make sure this works correctly
    toSpec: toSpec as any, // TODO make sure this works correctly
  });

  return {
    diffs,
    results: [],
    version: packageJson.version,
  };
};

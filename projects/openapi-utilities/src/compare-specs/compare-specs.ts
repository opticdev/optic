import { ObjectDiff, diff } from '../diff/diff';
import { RuleResult } from '../results';
import { FlatOpenAPIV3, FlatOpenAPIV3_1 } from '../flat-openapi-types';
const packageJson = require('../../package.json');

type SerializedSourcemap = {
  rootFilePath: string;
  files: Array<{
    path: string;
    index: number;
    contents: string;
    sha256: string;
  }>;

  refMappings: { [key: string]: [number, string] };
};

type InputSpec = {
  jsonLike: FlatOpenAPIV3.Document | FlatOpenAPIV3_1.Document;
  sourcemap: SerializedSourcemap;
  isEmptySpec: boolean;
};

type RuleRunner = {
  runRules: (inputs: {
    context: any;
    diffs: ObjectDiff[];
    fromSpec: FlatOpenAPIV3.Document | FlatOpenAPIV3_1.Document;
    toSpec: FlatOpenAPIV3.Document | FlatOpenAPIV3_1.Document;
  }) => Promise<RuleResult[]>;
};

export const compareSpecs = async (
  from: InputSpec,
  to: InputSpec,
  ruleRunner: RuleRunner,
  context: any
): Promise<CompareSpecResults> => {
  const adjustedFromSpec = from.isEmptySpec ? { paths: {} } : from.jsonLike;
  const adjustedToSpec = to.isEmptySpec ? { paths: {} } : to.jsonLike;
  const diffs = diff(adjustedFromSpec, adjustedToSpec);

  const results = await ruleRunner.runRules({
    context,
    diffs,
    fromSpec: from.jsonLike,
    toSpec: to.jsonLike,
  });

  return {
    diffs,
    results,
    version: packageJson.version,
  };
};

export type CompareSpecResults = {
  diffs: ObjectDiff[];
  results: RuleResult[];
  version: string;
};

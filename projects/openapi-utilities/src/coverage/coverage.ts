export type CoverageNode = {
  seen: boolean;
  diffs: boolean;
};

export type OperationCoverage = CoverageNode & {
  checksum: string;
  interactions: number;
  requestBody?: CoverageNode;
  responses: {
    [statusCode: string]: CoverageNode;
  };
};

export type ApiCoverage = {
  paths: {
    [pathPattern: string]: {
      [methods: string]: OperationCoverage;
    };
  };
};

export function countOperationCoverage(
  operation: OperationCoverage,
  fn: (x: CoverageNode) => boolean
): number {
  let coverage = 0;

  if (fn(operation)) {
    coverage++;
  }
  if (operation.requestBody && fn(operation.requestBody)) {
    coverage++;
  }
  for (const response of Object.values(operation.responses)) {
    if (fn(response)) {
      coverage++;
    }
  }

  return coverage;
}

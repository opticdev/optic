export type CheckFunction = ({
  endpointChange,
  endpoint,
}: {
  endpointChange: any;
  endpoint: any;
}) => Promise<string | undefined>;

export type EndpointChangeChecksOptions = {
  sinceBatchCommitId: string;
  spectacle: any;
};

export type CheckFunctionRegistry = {
  added: CheckFunction[];
  updated: CheckFunction[];
  removed: CheckFunction[];
};

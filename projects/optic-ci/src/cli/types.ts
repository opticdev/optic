export type CliConfig = {
  opticToken?: string;
  gitProvider?: {
    token: string;
  };
  // TODO deprecate ciProvider
  ciProvider?: 'github' | 'circleci';
};

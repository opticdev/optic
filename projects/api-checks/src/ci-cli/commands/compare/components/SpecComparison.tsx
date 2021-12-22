import React, { FC } from 'react';
import { Box, Newline, Text } from 'ink';
import { ResultWithSourcemap } from '../../../../sdk/types';

import { RenderCheckResults, SourcemapRendererEnum } from './render-results';

export const SpecComparison: FC<{
  results: ResultWithSourcemap[];
  verbose: boolean;
  mapToFile: SourcemapRendererEnum;
}> = ({ results, verbose, mapToFile }) => {
  return (
    <Box flexDirection="column">
      <Newline />
      <RenderCheckResults
        results={results}
        verbose={verbose}
        mapToFile={mapToFile}
      />
      <Box alignItems="flex-start" flexDirection="column" marginTop={3}>
        <Text bold color="green">
          {results.filter((i) => i.passed).length} checks passed
          {verbose && results.some((i) => i.passed) && (
            <Text color="grey"> run with --verbose flag to see results</Text>
          )}
        </Text>
        <Text bold color="red">
          {results.filter((i) => !i.passed).length} checks failed
        </Text>
      </Box>
    </Box>
  );
};

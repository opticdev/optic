import React from 'react';
import { Box, Text, useInput } from 'ink';
import { useDiffAgentActions } from '../context/diff-agent-context';

export function BypassError() {
  const { bypassIssue } = useDiffAgentActions();

  useInput(
    (input, key) => {
      if (key.return) {
        bypassIssue();
      }
    },
    { isActive: true }
  );

  return (
    <Box>
      <Text color="grey">
        press <Text color="cyan">(enter)</Text> to try Again
      </Text>
    </Box>
  );
}

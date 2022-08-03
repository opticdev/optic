import React from 'react';
import { Box, Text } from 'ink';

export function RenderPathMethod(props: { method: string; path: string }) {
  return (
    <Box flexDirection="row">
      <Text bold color="red">
        {'> '}
      </Text>
      <Text bold>{props.method.toUpperCase()} </Text>
      <Text>{props.path}</Text>
    </Box>
  );
}

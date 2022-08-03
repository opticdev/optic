import React, { useMemo } from 'react';
import { DiffBetweenSpecs } from '../utils/show-diff-between-specs';
import { Box, Newline, Text } from 'ink';

export function SpecUpdatePreview(props: { diffs: DiffBetweenSpecs }) {
  return (
    <Box flexDirection="column">
      {props.diffs.map((i, index) => (
        <Box flexDirection="column" key={index}>
          <SpecUpdateCard diff={i} />
          <Newline />
        </Box>
      ))}
    </Box>
  );
}

export function SpecUpdateCard(props: { diff: DiffBetweenSpecs[0] }) {
  const { hunk, line, path } = props.diff;

  const padStart = useMemo(() => {
    const largestLineNumerals = (line + hunk.length).toString().length;
    const smallestLineNumerals = line.toString().length;
    return largestLineNumerals - smallestLineNumerals;
  }, []);

  return (
    <Box flexDirection="column">
      {hunk.map((text, index) => {
        return (
          <Text key={index + 'hunk'} color="grey">
            <Text color="grey">{`${line + index}`.padStart(padStart)}: </Text>
            {text}
          </Text>
        );
      })}
      <Text underline color="blue">
        {`at (${path}:${line}:0)`}
      </Text>
    </Box>
  );
}

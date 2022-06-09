import React from 'react';
import { Box, Text } from 'ink';
import { JsonSchemaSourcemap } from '@useoptic/openapi-io';
import { sourcemapReader } from '@useoptic/openapi-utilities';
import os from 'os';
import { jsonPatcher } from '../../../../services/patch/incremental-json-patch/json-patcher';
import invariant from 'ts-invariant';

type Props = {
  render: RenderJsonSource;
};

export function CodeBlock(props: Props) {
  const linesToRender = React.useMemo(
    () => prepareSourceForRender(props.render),
    [props.render]
  );

  return (
    <Box flexDirection="column">
      {linesToRender.map((line, index) => {
        const color = highlightToBackgroundColor(line.highlight);

        return (
          <Text bold={line.highlight !== 'none'} key={index} color={color}>
            {line.contents}
          </Text>
        );
      })}
    </Box>
  );
}

const highlightToBackgroundColor = (
  highlight: Highlights
): string | undefined => {
  switch (highlight) {
    case 'green':
      return 'green';
    case 'yellow':
      return 'yellow';
    case 'red':
      return 'red';
    case 'none':
      return 'grey';
  }
};

type Highlights = 'none' | 'green' | 'red' | 'yellow';
type RenderJsonSource = {
  json: any;
  highlight?: {
    trail: string;
    wasMissing?: boolean;
    highlight: Highlights;
  };
};

type RenderLines = {
  contents: string;
  highlight: Highlights;
};

const prepareSourceForRender = (input: RenderJsonSource): RenderLines[] => {
  const patcher = jsonPatcher(input.json);

  if (input.highlight?.wasMissing) {
    patcher.apply(`add simulated ${input.highlight.trail}`, [
      { path: input.highlight.trail, op: 'add', value: 'EXPECTED' },
    ]);
  }

  const code = JSON.stringify(patcher.currentDocument(), null, 1);

  const sourcemap = new JsonSchemaSourcemap('');
  sourcemap.addFileIfMissingFromContents('', code, 0);
  const reader = sourcemapReader(sourcemap);

  const lines = code.split(os.EOL);

  let highlightLines: [number, number];
  if (input.highlight) {
    const lookup = reader.findFile(input.highlight.trail);
    invariant(
      Boolean(lookup),
      `could not render trail ${input.highlight.trail}`
    );
    const { astNode } = lookup;
    const position = reader.findLinesForAstAndContents(astNode, code);
    highlightLines = [position.startLine - 1, position.endLine - 1];
  }

  return lines.map((line, index) => {
    const inRange =
      highlightLines &&
      highlightLines[0] <= index &&
      index <= highlightLines[1];

    const cleanupLine =
      inRange && line.includes('"EXPECTED"') && input.highlight.wasMissing;

    const lineContents = cleanupLine
      ? `${line.split('"EXPECTED"')[0]} --- required but missing ---  `
      : line;
    return {
      contents: lineContents,
      highlight: inRange ? input.highlight.highlight : 'none',
    };
  });
};

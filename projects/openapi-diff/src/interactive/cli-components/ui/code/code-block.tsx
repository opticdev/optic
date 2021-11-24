import React from 'react';
import { Box, Text } from 'ink';
import { JsonSchemaSourcemap, sourcemapReader } from '@useoptic/openapi-io';
import os from 'os';
import { jsonPatcher } from '../../../../services/patch/incremental-json-patch/json-patcher';

type Props = {
  render: RenderJsonSource;
};

export function CodeBlock(props: Props) {
  const linesToRender = React.useMemo(
    () => prepareSourceForRender(props.render),
    [props.render]
  );

  const highlightToBackgroundColor = (
    highlight: Highlights
  ): [string, string] | [undefined, undefined] => {
    switch (highlight) {
      case 'green':
        return ['#2b810a', 'black'];
      case 'yellow':
        return ['#ffcf00', 'black'];
      case 'red':
        return ['#8f1919', 'white'];
      case 'none':
        return [undefined, undefined];
    }
  };

  return (
    <Box flexDirection="column">
      {linesToRender.map((line, index) => {
        const [bg, fg] = highlightToBackgroundColor(line.highlight);

        return (
          <Text bold={Boolean(bg)} key={index} backgroundColor={bg} color={fg}>
            {line.contents}
          </Text>
        );
      })}
    </Box>
  );
}

type Highlights = 'none' | 'green' | 'red' | 'yellow';
type RenderJsonSource = {
  json: any;
  highlight?: {
    trail: string;
    wasMissing: boolean;
    highlight: Highlights;
  };
};

type RenderLines = {
  contents: string;
  highlight: Highlights;
};

function prepareSourceForRender(input: RenderJsonSource): RenderLines[] {
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
    const astNode = reader.findFile(input.highlight.trail).astNode;
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
}

import React from 'react';
import { Box, Text } from 'ink';
import { highlight, Theme } from 'cli-highlight';
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

  const highlightToBackgroundColor = (highlight: Highlights) => {
    switch (highlight) {
      case 'green':
        return 'green';
      case 'yellow':
        return 'yellow';
      case 'red':
        return 'red';
      case 'none':
        return undefined;
    }
  };

  return (
    <Box flexDirection="column">
      {linesToRender.map((line) => (
        <Text backgroundColor={highlightToBackgroundColor(line.highlight)}>
          {line.contents}
        </Text>
      ))}
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
  const lines = highlight(code, { language: 'json' }).split(os.EOL);

  let highlightLines: [number, number];
  if (input.highlight) {
    const astNode = reader.findFile(input.highlight.trail).astNode;
    const position = reader.findLinesForAstAndContents(astNode, code);
    console.log(position);
    highlightLines = [position.startLine, position.endLine];
  }

  console.log(highlightLines);

  return lines.map((line, index) => {
    const inRange =
      highlightLines && highlightLines[0] < index && index < highlightLines[1];
    return {
      contents: line,
      highlight: inRange ? input.highlight.highlight : 'none',
    };
  });
}

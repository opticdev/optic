import React, { useMemo } from 'react';
import { Box, Newline } from 'ink';
// @ts-ignore
import Divider from 'ink-divider';
import { PatchesForBodyPropertyDiff } from '../../agents/questions';
import { ChangeView } from '../ui/change';
import { DiffType } from '../../../services/diff/types';
import chalk from 'chalk';
import { CodeBlock } from '../ui/code/code-block';
import invariant from 'ts-invariant';
import { usePatches } from '../hooks/use-patches';
import { useDiffAgentActions } from '../context/diff-agent-context';

const options = [
  {
    char: 'a',
    action: 'add path and operation',
  },
  {
    char: 's',
    action: 'skip this example',
  },
];

export function ReviewBodyPropertyPatches(props: {
  question: PatchesForBodyPropertyDiff;
}) {
  const [diffText, diffVisualization] = useMemo(
    () => diffToPreview(props.question),
    [props.question]
  );

  const { loading, patches } = usePatches(props.question.diff);
  const actions = useDiffAgentActions();

  return (
    <Box flexDirection={'column'}>
      <Newline />
      <ChangeView
        onAnswer={(patch) => {
          actions.answer(props.question.uuid, { patch });
        }}
        patches={{ loading, previews: patches }}
        observation={diffText}
      >
        {diffVisualization}
      </ChangeView>
    </Box>
  );
}

// helpers
function diffToPreview(
  question: PatchesForBodyPropertyDiff
): [string, React.ReactElement] {
  const example = (() => {
    if ('inRequest' in question.diff.location) {
      // @todo fix me -- need request version
      throw new Error('request needs to be implimented');
    } else if ('inResponse' in question.diff.location) {
      return JSON.parse(question.example.response.body.jsonBodyString);
    } else {
      invariant(false, 'example for diff can not be found');
    }
  })();

  switch (question.diff.type) {
    case DiffType.BodyAdditionalProperty:
      return [
        `Additional property ${chalk.cyan.bold(question.diff.key)}`,
        <CodeBlock
          render={{
            json: example,
            highlight: {
              highlight: 'green',
              trail: question.diff.instancePath,
            },
          }}
        />,
      ];
    case DiffType.BodyMissingRequiredProperty:
      return [
        `Missing required property ${chalk.cyan.bold(question.diff.key)}`,
        <CodeBlock
          render={{
            json: example,
            highlight: {
              highlight: 'red',
              wasMissing: true,
              trail: question.diff.instancePath,
            },
          }}
        />,
      ];
    case DiffType.BodyUnmatchedType:
      return [
        `Unmatched type for property ${chalk.cyan.bold(question.diff.key)}`,
        <CodeBlock
          render={{
            json: example,
            highlight: {
              highlight: 'yellow',
              trail: question.diff.instancePath,
            },
          }}
        />,
      ];
  }
}

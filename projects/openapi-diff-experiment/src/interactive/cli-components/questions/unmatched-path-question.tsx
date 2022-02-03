import React, { useMemo, useState } from 'react';
import { Box, Newline, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
// @ts-ignore
import Divider from 'ink-divider';
import { RenderPathMethod } from '../ui/render-path-method';
import {
  urlPathDiff,
  urlPathDiffFromSpec,
} from '../../../services/diff/differs/url-path-diff';
import quote from 'ajv/dist/runtime/quote';
import { AnswerBar } from '../ui/answer-bar';
import { AddPathAnswer, AddPathQuestion } from '../../agents/questions';
import { tabInPath } from '../utils/tab-or-delete-in-path';
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

export function UnmatchedPathQuestion(props: { question: AddPathQuestion }) {
  const [pathPattern, setPathPattern] = useState(
    props.question.diff.closestMatch
  );
  const actions = useDiffAgentActions();
  const [autocompleteKey, setAutocompleteKey] = useState(0);

  const [option, setOption] = useState<string | null>(null);

  const matchesOriginalExample: boolean = useMemo(() => {
    try {
      const { isMatch } = urlPathDiff([pathPattern.trim()]).compareToPath(
        props.question.diff.method,
        props.question.diff.path
      );
      return isMatch;
    } catch (e) {
      return false;
    }
  }, [pathPattern]);

  useInput(
    (input, key) => {
      if (key.tab) {
        setPathPattern(tabInPath(pathPattern, props.question.diff.path));
        setAutocompleteKey((i) => i + 1);
      }
    },
    { isActive: option === 'a' }
  );

  return (
    <Box flexDirection={'column'}>
      <Newline />
      <Divider title="Unmatched Path Observed" />

      <RenderPathMethod
        method={props.question.diff.method}
        path={props.question.diff.path}
      />

      {option === 'a' && (
        <>
          <Box marginRight={1} flexDirection="row">
            <Text bold color="cyan">
              {'  '}
              provide a path pattern:{' '}
            </Text>
          </Box>
          <Box flexDirection="row">
            <Text bold> {' ' + props.question.diff.method.toUpperCase()} </Text>
            <TextInput
              key={autocompleteKey}
              showCursor={true}
              focus={true}
              value={pathPattern}
              onChange={setPathPattern}
              onSubmit={() => {
                const answer: AddPathAnswer = {
                  pathPattern: pathPattern.trim(),
                };
                actions.answer(props.question.uuid, answer);
              }}
            />
          </Box>
          <Box paddingLeft={6} flexDirection="column">
            {matchesOriginalExample && (
              <Box>
                <Text bold color="green">
                  matches example
                </Text>
                <Text bold color="grey">
                  {' '}
                  press{' '}
                  <Text bold color="cyan">
                    (enter)
                  </Text>{' '}
                  to add operation to spec
                </Text>
              </Box>
            )}
            {!matchesOriginalExample && (
              <Box>
                <Text bold color="red">
                  does not match example
                </Text>
                <Text bold color="grey">
                  {' '}
                  update the pattern before adding to spec
                </Text>
              </Box>
            )}
            <Box>
              <Text bold color="grey">
                {'                '}
                press{' '}
                <Text bold color="cyan">
                  (escape)
                </Text>{' '}
                to go back
              </Text>
            </Box>
          </Box>
        </>
      )}

      <AnswerBar
        onSelect={(option) => {
          if (option === 's') {
            return actions.skipInteraction();
          }
          setOption(option);
        }}
        options={options}
        hide={Boolean(option)}
      />
    </Box>
  );
}

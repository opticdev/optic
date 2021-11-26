import React, { useMemo, useState } from 'react';
import { Box, Newline, Spacer, Text } from 'ink';
// @ts-ignore
import Divider from 'ink-divider';
import useStdoutDimensions from 'ink-use-stdout-dimensions';
import { RenderPathMethod } from './render-path-method';
import { AnswerBar } from './answer-bar';
import { keys } from '../utils/keys';
import {
  PatchPreview,
  useDiffAgentActions,
} from '../context/diff-agent-context';
import { SpecUpdatePreview } from './spec-update-preview';
import { IPatchGroup } from '../../../services/patch/incremental-json-patch/json-patcher';
import { JsonSchemaPatch } from '../../../services/diff/differs/json-schema-json-diff/plugins/plugin-types';

type Props = {
  observation: string;
  children: React.ReactElement;
  patches: {
    loading: boolean;
    previews: PatchPreview[];
  };
  onAnswer: (selectedPatch: JsonSchemaPatch) => void;
};

export function ChangeView(props: Props) {
  const [columns] = useStdoutDimensions();
  const actions = useDiffAgentActions();

  const [patchIndex, setPatchIndex] = useState<number>(0);

  const patchCursor = `(${patchIndex + 1}/${props.patches.previews.length})`;

  const selectedPatch = props.patches.previews[patchIndex];

  return (
    <Box flexDirection="column">
      <Divider width={columns - 10} title={props.observation} />
      {props.children}
      {props.patches.loading && (
        <Text color="yellow">Computing patches...</Text>
      )}
      {!props.patches.loading && selectedPatch ? (
        <>
          <Newline />
          <Divider width={columns - 10} title={'OpenAPI patches'} />
          <SpecUpdatePreview diffs={selectedPatch.preview} />

          <Box flexDirection="column" borderStyle="round" borderColor="yellow">
            <Box paddingRight={1} key={setPatchIndex.toString()}>
              <Box flexDirection="column" alignItems="flex-start">
                <Text bold>{selectedPatch.effect}</Text>
                <Text color="grey">
                  patch <Text color="grey">{patchCursor}</Text>
                </Text>
              </Box>
              <Spacer />
              <Box flexDirection="column">
                <RenderPathMethod path="/example/{exampleId}" method="GET" />
                <Text color="grey">{'  '}200 Response | application/json</Text>
              </Box>
            </Box>
          </Box>
        </>
      ) : null}

      <Box flexDirection="column">
        <AnswerBar
          onSelect={(option) => {
            if (option === 's') {
              return actions.skipQuestion();
            }
            if (option === 'a' && selectedPatch) {
              return props.onAnswer(selectedPatch.jsonSchemaPatch);
            }
            if (
              option === keys.rightArrow &&
              props.patches.previews.length > patchIndex + 1
            ) {
              return setPatchIndex((i) => i + 1);
            }
            if (option === keys.leftArrow && patchIndex - 1 >= 0) {
              return setPatchIndex((i) => i - 1);
            }
          }}
          hide={false}
          options={options}
        />
      </Box>
    </Box>
  );
}

const options = [
  {
    char: 'a',
    action: 'approve',
  },
  {
    char: keys.leftArrow,
    action: 'show previous patch',
  },
  {
    char: keys.rightArrow,
    action: 'show next patch',
  },
  {
    char: 's',
    action: 'skip',
  },
];

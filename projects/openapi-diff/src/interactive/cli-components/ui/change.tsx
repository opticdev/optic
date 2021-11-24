import React, { useMemo } from 'react';
import { Box, Spacer, Text } from 'ink';
// @ts-ignore
import Divider from 'ink-divider';
import useStdoutDimensions from 'ink-use-stdout-dimensions';
import { RenderPathMethod } from './render-path-method';
import { AnswerBar } from './answer-bar';
import { keys } from '../utils/keys';

type Props = {};

export function ChangeView(props: Props) {
  const [columns] = useStdoutDimensions();

  return (
    <Box flexDirection="column">
      <Divider width={columns} title={'Observation'} />
      <Text>CONTENT</Text>
      <Divider width={columns} title={'Patch (1/1)'} />

      <Box
        borderStyle="round"
        borderColor="yellow"
        marginTop={1}
        paddingRight={1}
      >
        <Box flexDirection="column" alignItems="flex-start">
          <Text bold>Add property `hello`</Text>
          <Text color="grey">
            patch <Text color="blue">{'(1/2)'}</Text>
          </Text>
        </Box>
        <Spacer />
        <Box flexDirection="column">
          <RenderPathMethod path="/example/{exampleId}" method="GET" />
          <Text color="grey">{'  '}200 Response | application/json</Text>
        </Box>
      </Box>

      <Box flexDirection="column">
        <AnswerBar
          onSelect={(option) => {
            console.log(option);
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

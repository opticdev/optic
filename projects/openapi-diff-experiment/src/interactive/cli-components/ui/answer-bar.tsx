import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { keys } from '../utils/keys';

export function AnswerBar(props: {
  options: AnswerBarOption[];
  hide: boolean;
  onSelect: (option: string | null) => void;
}) {
  useInput((key, modifier) => {
    if (modifier.escape) {
      return props.onSelect(null);
    }

    if (props.hide) return;

    const selectedOption = props.options.find((i) => {
      return (
        i.char === key ||
        (i.char === keys.leftArrow && modifier.leftArrow) ||
        (i.char === keys.rightArrow && modifier.rightArrow)
      );
    });

    if (!selectedOption) {
      return;
    }

    if (selectedOption) {
      props.onSelect(selectedOption.char);
    }
  });

  if (props.hide) {
    return null;
  }

  return (
    <Box flexDirection="column" paddingLeft={2} paddingTop={1}>
      <Text bold>Patch Usage:</Text>
      {props.options.map((i, index) => {
        return <Option key={index} {...i} />;
      })}
    </Box>
  );
}

type AnswerBarOption = {
  char: string;
  action: string;
};

function Option(props: AnswerBarOption) {
  return (
    <Text color="grey">
      Press{' '}
      <Text bold color="cyan">
        {props.char}
      </Text>{' '}
      to {props.action}
    </Text>
  );
}

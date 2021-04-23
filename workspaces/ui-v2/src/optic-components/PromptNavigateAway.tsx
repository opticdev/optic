import * as React from 'react';
import { FC, useEffect } from 'react';
import { Prompt } from 'react-router';

type PromptNavigateAwayProps = {
  shouldPrompt: boolean;
};

export const PromptNavigateAway: FC<PromptNavigateAwayProps> = ({
  shouldPrompt,
}) => {
  useEffect(() => {
    window.onbeforeunload = shouldPrompt ? () => true : null;

    return () => {
      window.onbeforeunload = null;
    };
  }, [shouldPrompt]);
  return (
    <Prompt
      when={shouldPrompt}
      message="You have unsaved changes, are you sure you want to leave?"
    />
  );
};

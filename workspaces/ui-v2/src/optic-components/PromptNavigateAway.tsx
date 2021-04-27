import * as React from 'react';
import { FC, useEffect } from 'react';
import { Prompt } from 'react-router';

type PromptNavigateAwayProps = {
  shouldPrompt: boolean;
};

/**
 * Note that this includes a destructive useEffect for onbeforeunload which means
 * that this component can only be used once (on unmount / update useEffect, the mount/unmount will
 * tear down other onbeforeunloads)
 */
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

import React from 'react';
import { Button } from '@material-ui/core';

export const NeedHelp = () => {
  const askForHelp = () => {
    window.Intercom('showNewMessage', 'Hey Optic team, I have a question!');
    window.Intercom('update', { hide_default_launcher: false });
  };
  return (
    <Button color="secondary" onClick={askForHelp}>
      Need Help?
    </Button>
  );
};

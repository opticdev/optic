import React, { useMemo } from 'react';
import Page from '../Page';
import { makeStyles } from '@material-ui/core/styles';
import { SetupAPIFlow } from './setup-api/SetupAPIFlow';

export function SetupPage(props) {
  const classes = useStyles();

  return (
    <Page title="Setup your API Start task">
      <Page.Body padded={true}>
        <SetupAPIFlow />
      </Page.Body>
    </Page>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: 18,
    maxWidth: 920,
    width: '100%',
  },
}));

import React from 'react';
import Page from '../Page';
import { makeStyles } from '@material-ui/core/styles';

export default function TestingDashboardTeaserPage() {
  const classes = useStyles();

  return (
    <Page title="Optic - Coming soon: Live contract testing">
      <Page.Navbar mini={true} />

      <Page.Body>
        <div className={classes.root}>
          <h2>Coming soon: Live contract testing</h2>
        </div>
      </Page.Body>
    </Page>
  );
}

const useStyles = makeStyles((theme) => {
  root: {
  }
});

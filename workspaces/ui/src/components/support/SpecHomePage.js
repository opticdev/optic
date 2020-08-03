import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import EmptyState from './EmptyState';
import { AddOpticLink, DocumentingYourApi, OpticDocs } from './Links';

const useStyles = makeStyles((theme) => ({
  body: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
  },
}));

export default function SpecHomePage(props) {
  const classes = useStyles();

  return (
    <div className={classes.body}>
      <div style={{ marginTop: -150 }}>
        <EmptyState
          title={'View Uploaded Specs Here'}
          content={`
To upload your specification here, simply run the publish command

    npm install -g @useoptic/ci-cli
    optic-ci publish

**Useful Links**
- [Add Optic to your API Project](${AddOpticLink})
- [Document your API with Optic](${DocumentingYourApi})
- [Explore all the Optic Documentation](${OpticDocs})
`.trim()}
        />
      </div>
    </div>
  );
}

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

export default function WelcomePage(props) {
  const classes = useStyles();
  const { title, content } = props;

  return (
    <div className={classes.body}>
      <div style={{ marginTop: -150 }}>
        <EmptyState
          title={'Optic is Monitoring your APIs'}
          content={`
**Getting Started**
- [Add Optic to your API Project](${OpticDocs})
- [Document your API with Optic](${OpticDocs})
- [Explore all the Optic Documentation](${OpticDocs})
`.trim()}
        />
      </div>
    </div>
  );
}

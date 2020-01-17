import React from 'react'
import makeStyles from '@material-ui/core/styles/makeStyles';
import {createStyles} from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import {MarkdownRender} from '../requests/DocContribution';

const useStyles = makeStyles((theme) => createStyles({
  root: {},
  noPadding: {
    padding: '0 !important'
  },
  helperRoot: {
    display: 'flex',
  },
  content: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 12,
    paddingLeft: 14,
    paddingTop: 14
  },
  text: {
    ...theme.typography.subtitle1,
    paddingTop: 10,
  }
}));


export function ProductDemoStoreBase(props) {
  const classes = useStyles();
  return (
    <Dialog open={false} maxWidth="md" fullWidth>
      <div style={{height: 700}}>
{/*      <MarkdownRender source={`*/}
{/*### Downloading Optic*/}

{/*\`\`\`bash*/}
{/*npm install @useoptic/cli -g*/}
{/*\`\`\`*/}
{/*      `} />*/}
      </div>
    </Dialog>
  );
}

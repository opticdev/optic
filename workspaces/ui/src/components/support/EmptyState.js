import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ReactMarkdown from 'react-markdown';
import {Button, CardActions, Typography} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import {DocDivider} from '../requests/DocConstants';
import {secondary} from '../../theme';

const useStyles = makeStyles((theme) => ({
  header: {
    textAlign: 'center',
    marginBottom: 22
  },
  paper: {
    padding: 20,
    width: 400,
    margin: '0px auto',
    paddingBottom: 10,
  },
  inlineCode: {
    backgroundColor: '#e2e2e2',
    padding: 2,
    fontSize: 12,
    paddingTop: 1,
    paddingBottom: 1,
    display: 'inline-block',
    color: secondary
  }
}));

export default function EmptyState(props) {
  const classes = useStyles();
  const {title, content} = props

  return (
    <Paper className={classes.paper}>
      <div className={classes.header}>
        <img src="/optic-logo.svg" />
        <Typography variant="h6" color="primary">{title}</Typography>
      </div>

      <DocDivider style={{marginBottom : 30}}/>

      <EmptyStateMarkdown source={content}/>

      <div style={{display: 'flex', marginTop: 15}}>
        <div style={{flex: 1}} />
        <Button color="secondary">Need Help?</Button>
      </div>
    </Paper>
  )
}

function EmptyStateMarkdown({source, style}) {

  const classes = useStyles();


  return <div style={style}>
    <ReactMarkdown
      source={source}
      renderers={{
        paragraph: ({children}) => (
          <Typography variant="body2" style={{fontWeight: 200, marginTop: 11, whiteSpace: 'pre-wrap'}}>
            {children}
         </Typography>
        ),
        inlineCode: ({children}) => (
          <Typography className={classes.inlineCode}>{children}</Typography>
        )
      }}
    />
  </div>;
}

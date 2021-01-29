import React from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import { Avatar, Typography } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import { FormatCopy } from './FormatCopy';
import Divider from '@material-ui/core/Divider';
export const useStyles = makeStyles({
  bg: {
    backgroundColor: '#f5f5f5',
    paddingTop: 30,
    paddingBottom: 30,
    borderTop: '1px solid #e2e2e2',
    borderBottom: '1px solid #e2e2e2',
  },
  quoteBody: {
    backgroundColor: 'white',
    borderRadius: 12,
  },
  quote: {
    fontSize: 18,
    padding: 16,
    fontWeight: 400,
  },
  info: {
    padding: 16,
  },
  author: {
    fontSize: 18,
    fontWeight: 500,
  },
  authorTitle: {
    color: '#a9aec3',
    fontWeight: 400,
    textTransform: 'uppercase',
    lineHeight: 1.2,
  },
  credoHeader: {
    fontWeight: 100,
    fontSize: 16,
    color: '#6d757d',
    fontFamily: 'Ubuntu Mono',
  },
  logoWrapper: {
    display: 'inline-flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 12,
    justifyContent: 'flex-start',
    filter: 'grayscale(50%)',
  },
  git: {
    paddingTop: 9,
    marginTop: 5,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export function Quote(props) {
  const classes = useStyles();
  const { name, title, quote, pic } = props;

  return (
    <Paper elevation={2} style={{ flex: 1 }} className={classes.quoteBody}>
      <Typography variant="subtitle2" className={classes.quote}>
        <FormatCopy value={quote} />
      </Typography>
      <Divider />
      <div
        className={classes.info}
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <div style={{ width: 65 }}>
          <Avatar src={'../../static/img'+pic} />
        </div>

        <div>
          <div className={classes.author}>{name}</div>
          <span className={classes.authorTitle}>
            <FormatCopy
              value={title}
              style={{ whiteSpace: 'pre', textAlign: 'justify' }}
            />
          </span>
        </div>
      </div>
    </Paper>
  );
}

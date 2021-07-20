import React from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import { Avatar, Typography } from '@material-ui/core';
import { FormatCopy } from './FormatCopy';
import { UpdatedBlueBackground } from './theme';

export const useStyles = makeStyles({
  bg: {
    paddingTop: 30,
    paddingBottom: 30,
    borderTop: '1px solid #e2e2e2',
    borderBottom: '1px solid #e2e2e2',
  },
  quoteBody: {
    borderRadius: 12,
  },
  quote: {
    fontSize: 16,
    lineHeight: 1.7,
    borderRadius: 17,
    overflow: 'hidden',
    backgroundColor: UpdatedBlueBackground,
    marginBottom: 10,
    fontFamily: 'Inter',
    color: '#586069',
    padding: 16,
    fontWeight: 400,
    textAlign: 'justify',
  },
  info: {
    padding: 7,
    paddingLeft: 20,
  },
  author: {
    fontSize: 14,
    fontWeight: 500,
  },
  authorTitle: {
    color: '#586069',
    fontWeight: 400,
    fontSize: 15,
    textAlign: 'justify',
    textTransform: 'uppercase',
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
    <div elevation={3} style={{ flex: 1 }} className={classes.quoteBody}>
      <Typography variant="subtitle1" className={classes.quote}>
        <FormatCopy value={quote} />
      </Typography>
      <div style={{ flex: 1 }} />
      <div
        className={classes.info}
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <div style={{ width: 65 }}>
          <Avatar src={'/img' + pic} />
        </div>

        <div>
          <div className={classes.author}>{name}</div>
          <div className={classes.authorTitle}>
            <FormatCopy
              value={title}
              style={{ whiteSpace: 'pre', textAlign: 'justify' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

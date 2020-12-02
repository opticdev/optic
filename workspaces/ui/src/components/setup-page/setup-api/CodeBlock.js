import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import makeStyles from '@material-ui/core/styles/makeStyles';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import * as copy from 'copy-to-clipboard';
import { UpdatedBlueBackground } from '../../../theme';

const useStyles = makeStyles((theme) => ({
  copybtn: {
    // position: 'absolute',
    color: 'white',
  },
  root: {
    overflow: 'none',
    marginTop: 8,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgb(40, 42, 54)',
  },
  codeInline: {
    padding: 3,
    paddingLeft: 5,
    paddingRight: 5,
    fontWeight: 100,
    backgroundColor: UpdatedBlueBackground,
    fontFamily: 'Ubuntu Mono',
  },
}));

export const Code = (props) => {
  const classes = useStyles();
  return (
    <span className={classes.codeInline} style={props.style}>
      {props.children}
    </span>
  );
};

export function CodeBlock({ code, lang, style }) {
  const classes = useStyles();
  return (
    <Paper elevation={2} className={classes.root} style={style}>
      <div style={{ flex: 1, paddingLeft: 2 }}>
        <SyntaxHighlighter
          language={lang}
          style={dracula}
          customStyle={{ whiteSpace: 'pre-wrap' }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
      <div style={{ paddingRight: 9 }}>
        <Tooltip title="Copy Code to Clipboard">
          <IconButton
            size="small"
            className={classes.copybtn}
            onClick={() => copy(code)}
          >
            <FileCopyIcon style={{ width: 20 }} />
          </IconButton>
        </Tooltip>
      </div>
    </Paper>
  );
}

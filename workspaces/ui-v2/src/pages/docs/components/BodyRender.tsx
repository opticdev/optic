import * as React from 'react';
import makeStyles from '@material-ui/styles/makeStyles';

// TODO QPB - create path parameter panel and delete this component
export type CodeBlockProps = {
  header?: any;
  children: any;
  headerText?: string;
};

export function CodeBlock({ header, children, headerText }: CodeBlockProps) {
  const classes = useStyles();
  return (
    <div className={classes.wrapper}>
      <div className={classes.header}>{headerText || header}</div>
      <div className={classes.content} style={{ padding: 0 }}>
        {children}
      </div>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  wrapper: {
    overflow: 'hidden',
    width: '100%',
  },
  headerRegion: {
    display: 'flex',
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
  },
  content: {
    backgroundColor: '#f8fafc',
    paddingTop: 8,
    paddingBottom: 8,
    borderTop: 'none',
    maxHeight: '80vh',
    overflowY: 'auto',
    borderLeft: '1px solid #e4e8ed',
    borderRight: '1px solid #e4e8ed',
    borderBottom: '1px solid #e4e8ed',
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 4,
  },
  header: {
    backgroundColor: '#e4e8ed',
    color: '#4f566b',
    flex: 1,
    fontSize: 13,
    height: 35,
    display: 'flex',
    fontWeight: 400,
    paddingLeft: 13,
    fontFamily: 'Roboto',
    alignItems: 'center',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
    borderBottom: '1px solid #e2e2e2',
  },
}));

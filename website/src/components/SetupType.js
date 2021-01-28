import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import TextLoop from 'react-text-loop';
import { Code } from './CodeBlock';
import {primary, secondary} from './theme';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexGrow: 1,
  },
  paper: {
    position: 'relative',
    marginBottom: 12,
    borderRadius: 7,
    backgroundColor: '#f5f1f0',
    overflow: 'hidden',
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 30,
    justifyContent: 'center',
    minHeight: 186,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    border: `2px solid transparent`,
    transition: 'transform .2s',
    '&:hover': {
      transform: 'scale(1.03)',
    },
    cursor: 'pointer',
  },
  selected: {
    border: `2px solid ${secondary}`,
    '&:hover': {
      transform: 'scale(1) !important',
    },
  },
  scroller: {
    fontFamily: 'Ubuntu Mono',
    fontWeight: 100,
    fontSize: 19,
  },
  demo: {
    display: 'flex',
    fontFamily: 'Ubuntu Mono',
    fontSize: 19,
    flexDirection: 'row',
  },
  chip: {
    position: 'absolute',
    right: 2,
    top: 2,
    padding: 2,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 5,
    fontFamily: 'Ubuntu Mono',
    color: primary,
    fontSize: 15,
    backgroundColor: '#e2e2e2',
    textTransform: 'uppercase',
    fontWeight: 600,
  },
  caption: {
    marginTop: 12,
    fontFamily: 'Ubuntu Mono',
    color: '#808080',
    paddingLeft: 50,
    paddingRight: 50,
  },
}));

export function DemoStartCommandSetup() {
  const classes = useStyles();

  return (
    <div className={classes.demo}>
      <TextLoop
        springConfig={{ stiffness: 180, damping: 7 }}
        className={classes.scroller}
      >
        {examples.map((i) => (
          <span>{i}</span>
        ))}
      </TextLoop>
      {rightArrow}
      <Code>
        <span style={{ color: primary, fontWeight: 800 }}>api start</span>
      </Code>
    </div>
  );
}

const examples = [
  'npm start',
  'rails server',
  'flask run',
  'go run server.go',
  'sails lift',
  'dotnet run',
  'php artisan serve',
  'cargo run',
];

const rightArrow = (
  <span
    style={{
      fontWeight: 200,
      marginLeft: 10,
      marginRight: 10,
      color: primary,
    }}
  >
    →
  </span>
);

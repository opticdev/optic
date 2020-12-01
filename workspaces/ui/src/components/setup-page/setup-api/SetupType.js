import React, { useContext } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import classnames from 'classnames';
import {
  primary,
  secondary,
  UpdatedBlue,
  UpdatedBlueBackground,
  UpdatedBlueBackgroundMedium,
} from '../../../theme';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import TextLoop from 'react-text-loop';
import { Typography } from '@material-ui/core';
import { MODES } from './events';

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
    marginTop: 10,
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

export function SetupType({ value, onChoose }) {
  const classes = useStyles();
  return (
    <Grid container spacing={2}>
      <Grid xs={12} item>
        <Card
          className={classnames(classes.paper, {
            [classes.selected]: value === MODES.RECOMMENDED,
          })}
          onClick={() => onChoose(MODES.RECOMMENDED)}
        >
          <div className={classes.chip}>Recommended</div>
          <Typography variant="h6" className={classes.name}>
            Start your API with Optic
          </Typography>

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
            <span style={{ color: primary, fontWeight: 800 }}>api start</span>
          </div>

          <Typography variant="caption" className={classes.caption}>
            Great for when you have access to the API code and can run it
            locally
          </Typography>
        </Card>
      </Grid>
      <Grid xs={12} item>
        <Card
          className={classnames(classes.paper, {
            [classes.selected]: value === MODES.MANUAL,
          })}
          onClick={() => onChoose(MODES.MANUAL)}
        >
          <div className={classes.chip}>Advanced</div>
          <Typography variant="h6" className={classes.name}>
            Manually Configure Proxy
          </Typography>
          <div className={classes.demo}>
            {`localhost`}
            {rightArrow}
            <img src={require('../../../assets/only-optic.svg')} width={30} />
            {rightArrow}
            {`api.hostname`}
          </div>
          <Typography
            variant="caption"
            className={classes.caption}
            style={{ paddingLeft: 10, paddingRight: 10 }}
          >
            Great for when the API you are targeting is remote or when you need
            more control of the Optic proxy.
          </Typography>
        </Card>
      </Grid>
    </Grid>
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

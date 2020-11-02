import React from 'react';
import theme from '../../decorators/theme';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import LaunchIcon from '@material-ui/icons/Launch';
import withStyles from '@material-ui/core/styles/withStyles';
import {
  OpticBlue,
  primary,
  secondary,
  SubtleBlueBackground,
} from '../../../theme';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { LightTooltip } from '../../../components/tooltips/LightTooltip';
import { DocDarkGrey } from '../../../components/docs/DocConstants';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';
export default {
  title: 'Navigation/ Top Bar',
  decorators: [theme],
};

const useStyles = makeStyles((theme) => ({
  root: {
    height: '40px !important',
    minHeight: 'auto !important',
    zIndex: 1000,
    backgroundColor: SubtleBlueBackground,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  toggle: {
    height: 24,
  },
  selectedToggle: {
    backgroundColor: `${OpticBlue} !important`,
    color: 'white !important',
  },
  toolbar: {
    height: '40px !important',
    minHeight: 'auto !important',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingLeft: 15,
    paddingTop: theme.spacing(0),
    paddingBottom: theme.spacing(0),
  },
  title: {
    fontSize: 16,
  },
  stacked: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  visitApiPage: {
    fontSize: 10,
  },
  link: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabs: {
    marginLeft: 22,
    display: 'flex',
    alignItems: 'center',
  },
  spacer: {
    flex: 1,
  },
}));

const pages = [
  { name: 'Document', linkTo: '' },
  { name: 'Review Diff', linkTo: '' },
  { name: 'Design', linkTo: '' },
];

export function TopNavigation(props) {
  const classes = useStyles();
  return (
    <div className={classes.root} key="top-navigation">
      <AppBar position="static" color="transparent" elevation={2}>
        <Toolbar className={classes.toolbar}>
          <div className={classes.stacked}>
            <Typography className={classes.title} variant="subtitle2" noWrap>
              optic/backend-v1
            </Typography>
            <LightTooltip title="Open API Page">
              <a
                component={'a'}
                href={'https://useoptic.com'}
                className={classes.link}
              >
                <LaunchIcon
                  color="primary"
                  style={{ marginLeft: 5, width: 10 }}
                />
              </a>
            </LightTooltip>
          </div>
          {/*<div className={classes.spacer} />*/}
          <div className={classes.tabs}>
            <ToggleButtonGroup
              size="small"
              exclusive
              className={classes.toggle}
            >
              {pages.map((i, index) => {
                return (
                  <ToggleButton
                    key={index}
                    classes={{ selected: classes.selectedToggle }}
                    selected={index === 1}
                  >
                    <Typography variant="caption">{i.name}</Typography>
                  </ToggleButton>
                );
              })}
            </ToggleButtonGroup>
          </div>
          <div className={classes.spacer} />
          <div>{props.controls}</div>
        </Toolbar>
      </AppBar>
    </div>
  );
}

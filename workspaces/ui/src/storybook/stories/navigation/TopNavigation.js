import React from 'react';
import theme from '../../decorators/theme';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import LaunchIcon from '@material-ui/icons/Launch';
import withStyles from '@material-ui/core/styles/withStyles';
import { OpticBlue, primary, secondary } from '../../../theme';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { LightTooltip } from '../../../components/tooltips/LightTooltip';
import { DocDarkGrey } from '../../../components/docs/DocConstants';
export default {
  title: 'Navigation/ Top Bar',
  decorators: [theme],
};

const useStyles = makeStyles((theme) => ({
  root: {
    height: '40px !important',
    minHeight: 'auto !important',
  },
  menuButton: {
    marginRight: theme.spacing(2),
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

export function TopNavigation(props) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <AppBar position="static" color="transparent" elevation={1}>
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
          <div className={classes.tabs}>
            <NavTabs value="Diff">
              {['Document', 'Diff', 'Design'].map((i) => (
                <NavTab value={i} label={i} />
              ))}
            </NavTabs>
          </div>
          <div className={classes.spacer} />
          <div>Visiting Navigation (from page)</div>
        </Toolbar>
      </AppBar>
    </div>
  );
}

const NavTabs = withStyles({
  root: {
    height: 40,
    minHeight: 'inherit',
  },
  indicator: {
    display: 'flex',
    justifyContent: 'center',
    color: primary,
    backgroundColor: 'transparent',
    '& > div': {
      width: '100%',
      backgroundColor: OpticBlue,
    },
  },
})((props) => <Tabs {...props} TabIndicatorProps={{ children: <div /> }} />);

const NavTab = withStyles((theme) => {
  return {
    root: {
      textTransform: 'none',
      color: primary,
      padding: 0,
      height: 40,
      paddingLeft: 10,
      paddingRight: 10,
      minHeight: 'inherit',
      minWidth: 'inherit',
      fontFamily: 'Ubuntu',
      fontWeight: 200,
      fontSize: theme.typography.pxToRem(15),
      marginRight: theme.spacing(2),
      '&:focus': {
        opacity: 1,
      },
    },
  };
})((props) => <Tab disableRipple {...props} />);

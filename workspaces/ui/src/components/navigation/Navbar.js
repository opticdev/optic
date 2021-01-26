import React, { useMemo, useState } from 'react';
import Drawer from '@material-ui/core/Drawer';
import { makeStyles } from '@material-ui/core/styles';
import { useRouterPaths } from '../../RouterPaths';
import { useEnabledFeatures } from '../../contexts/SpecServiceContext';
import { Link } from 'react-router-dom';
import IconButton from '@material-ui/core/IconButton';
import DescriptionIcon from '@material-ui/icons/Description';
import ChangeHistoryIcon from '@material-ui/icons/ChangeHistory';
import PolicyIcon from '@material-ui/icons/Policy';
import { LightTooltip } from '../tooltips/LightTooltip';

const drawerWidth = 270;
const miniWidth = 30;

const useStyles = makeStyles({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  miniDrawer: {
    width: miniWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    backgroundColor: '#0E1837',
    display: 'flex',
    flexDirection: 'row',
  },
  miniDrawerPaper: {
    backgroundColor: '#0E1837',
    display: 'flex',
    flexDirection: 'row',
  },
  topLevel: {
    width: miniWidth,
    // backgroundColor: '#2b3966',
    overflow: 'hidden',
    borderRight: '1px solid #3F5597',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
  },
  navButton: {
    marginTop: 6,
  },
  opticLogo: {
    marginTop: 5,
  },
  mainSection: {
    flex: 1,
  },
  iconStyles: {
    color: '#e2e2e2',
    width: 20,
    height: 20,
  },
});

export default function Navbar(props) {
  const classes = useStyles();
  const routerPaths = useRouterPaths();

  const enabledFeatures = useEnabledFeatures();

  const menuItems = useMemo(
    () => [
      {
        name: 'Review Diff',
        icon: <ChangeHistoryIcon className={classes.iconStyles} />,
        link: routerPaths.reviewRoot
      },
      {
        name: 'Documentation',
        icon: <DescriptionIcon className={classes.iconStyles} />,
        link: routerPaths.docsRoot,
      },
    ],
    [routerPaths]
  );

  return (
    <Drawer
      id="navbar"
      elevation={2}
      className={props.mini ? classes.miniDrawer : classes.drawer}
      variant={'permanent'}
      classes={{
        paper: props.mini ? classes.miniDrawerPaper : classes.drawerPaper,
      }}
      anchor="left"
    >
      <div
        className={classes.topLevel}
        style={props.mini && { borderRight: 'none' }}
      >
        <img src="/optic-logo.svg" width={25} className={classes.opticLogo} />
        {menuItems.map((i) => (
          <LightTooltip
            key={i.link}
            title={i.name}
            component={Link}
            to={i.link}
            placement="right"
            onClick={() => {
              // track(`Navigating to ${i.name}`, i)
            }}
          >
            <IconButton className={classes.navButton}>{i.icon}</IconButton>
          </LightTooltip>
        ))}
        <div style={{flex: 1}}/>
        <div>
          <LightTooltip
            // key={i.link}
            title={"Optic on Discord - ask for help, request features, contribute something :)"}
            component={'a'}
            target="_blank"
            href={'https://discord.gg/t9hADkuYjP'}
            placement="right"
            onClick={() => {
              // track(`Navigating to ${i.name}`, i)
            }}
          >
            <IconButton className={classes.navButton}><img height={25} src={require('../../assets/discord.svg')}/></IconButton>
          </LightTooltip>
        </div>
      </div>
      {props.mini ? null : (
        <div className={classes.mainSection}>{props.children}</div>
      )}
    </Drawer>
  );
}

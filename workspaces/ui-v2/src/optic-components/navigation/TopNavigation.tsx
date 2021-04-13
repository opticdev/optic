import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { SubtleBlueBackground, SubtleGreyBackground } from '../theme';
import { Container } from '@material-ui/core';
import SubjectIcon from '@material-ui/icons/Subject';
import { NavButton } from './NavButton';
import ChangeHistoryIcon from '@material-ui/icons/ChangeHistory';
import { useApiName } from '../hooks/useApiNameHook';
import { useDiffReviewPageLink, useDocumentationPageLink } from './Routes';

export function TopNavigation(props: { AccessoryNavigation: any }) {
  const classes = useStyles();
  const apiName = useApiName();

  const documentationPage = useDocumentationPageLink();
  const diffsPage = useDiffReviewPageLink();

  const { AccessoryNavigation } = props;
  return (
    <div className={classes.root} key="top-navigation">
      <Container maxWidth={false} style={{ paddingLeft: 0, paddingRight: 0 }}>
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar className={classes.toolbar}>
            <div className={classes.stacked}>
              <Typography
                className={classes.title}
                variant="subtitle2"
                noWrap
                component="span"
              >
                {apiName}
              </Typography>

              <NavButton
                title="Docs"
                to={documentationPage.linkTo()}
                Icon={SubjectIcon}
              />
              {/*@aidan: this needs to change*/}
              <NavButton
                title="Diffs"
                to={diffsPage.linkTo()}
                Icon={ChangeHistoryIcon}
              />
              {/*<NavButton title="Team" Icon={ImportExportIcon} />*/}
            </div>
            <div className={classes.spacer} />
            <div>{AccessoryNavigation && <AccessoryNavigation />}</div>
          </Toolbar>
        </AppBar>
      </Container>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    height: '40px !important',
    minHeight: 'auto !important',
    zIndex: 1000,
    borderBottom: `1px solid ${SubtleGreyBackground}`,
    backgroundColor: SubtleBlueBackground,
    position: 'fixed',
    width: '100%',
  },
  toolbar: {
    height: '40px !important',
    minHeight: 'auto !important',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 0,
    paddingTop: theme.spacing(0),
    paddingBottom: theme.spacing(0),
  },
  title: {
    fontSize: 16,
    marginRight: 10,
    color: '#4f566b',
  },
  stacked: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  spacer: {
    flex: 1,
  },
}));

import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { SubtleBlueBackground, SubtleGreyBackground } from '<src>/styles';
import { Container } from '@material-ui/core';
import { NavButton } from './NavButton';
import {
  ChangeHistory as ChangeHistoryIcon,
  Subject as SubjectIcon,
  Schedule as ScheduleIcon,
} from '@material-ui/icons';
import {
  useDiffReviewPageLink,
  useDocumentationPageLink,
  useChangelogHistoryPage,
} from './Routes';
import { useAppConfig } from '<src>/contexts/config/AppConfiguration';
import { useAppSelector } from '<src>/store';

export function TopNavigation(props: { AccessoryNavigation?: any }) {
  const classes = useStyles();
  const apiName = useAppSelector((state) => state.metadata.data?.apiName || '');
  const appConfig = useAppConfig();

  const documentationPage = useDocumentationPageLink();
  const changelogHistoryPage = useChangelogHistoryPage();
  const diffsPage = useDiffReviewPageLink();

  const { AccessoryNavigation } = props;
  return (
    <div>
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

                {appConfig.features.allowEditing && (
                  <NavButton
                    title="Diffs"
                    to={diffsPage.linkTo()}
                    Icon={ChangeHistoryIcon}
                  />
                )}
                <NavButton
                  title="History"
                  to={changelogHistoryPage.linkTo()}
                  Icon={ScheduleIcon}
                />
              </div>
              <div className={classes.spacer} />
              <div>{AccessoryNavigation && <AccessoryNavigation />}</div>
            </Toolbar>
          </AppBar>
        </Container>
      </div>
      <div className={classes.spacing}></div>
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
  spacing: {
    height: 41, //40px height + 1px border
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

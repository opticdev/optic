import React, { CSSProperties, FC, useState } from 'react';
import { Button, makeStyles } from '@material-ui/core';
import ClassNames from 'classnames';
import Color from 'color';
import {
  CompareArrows as CompareArrowsIcon,
  Schedule as ScheduleIcon,
  Subject as SubjectIcon,
} from '@material-ui/icons';
import { Link } from 'react-router-dom';

import {
  Page,
  useChangelogPages,
  useDocumentationPageLink,
} from '<src>/components';
import { useAnalytics } from '<src>/contexts/analytics';
import { useAppConfig } from '<src>/contexts/config/AppConfiguration';
import { BatchCommit, useBatchCommits } from '<src>/hooks/useBatchCommits';
import { formatTimeAgo } from '<src>/utils';
import {
  LightBlueBackground,
  OpticBlueReadable,
  FontFamily,
} from '<src>/styles';

import { ConfirmResetModal } from './components';

export const ChangelogHistory: FC = () => {
  const appConfig = useAppConfig();
  const { loading, batchCommits } = useBatchCommits();
  const changelogPage = useChangelogPages();
  const documentationPage = useDocumentationPageLink();
  const classes = useStyles();
  const analytics = useAnalytics();
  const [confirmResetModalState, setConfirmResetModalState] = useState<
    BatchCommit | false
  >(false);

  return (
    <Page>
      <Page.Navbar />
      <Page.Body padded className={classes.pageBody} loading={loading}>
        <section className={classes.changelogSection}>
          <div className={classes.changelogTimeline}>
            <ScheduleIcon className={classes.changelogIcon} />
          </div>

          <ol className={classes.commitsList}>
            {batchCommits.map((batchCommit, i) => {
              const isCurrent = i === 0;

              return (
                <li
                  className={ClassNames(classes.commitsListItem, {
                    [classes.isCurrent]: isCurrent,
                  })}
                  key={batchCommit.batchId}
                >
                  <div className={classes.commitDetails}>
                    <h4 className={classes.commitMessage}>
                      {batchCommit.commitMessage}
                    </h4>
                    <span className={classes.commitTime}>
                      {formatTimeAgo(new Date(batchCommit.createdAt))}
                    </span>
                  </div>

                  <div className={classes.commitControls}>
                    {isCurrent ? (
                      <Button
                        className={classes.commitDocsButton}
                        component={Link}
                        to={documentationPage.linkTo()}
                        variant="text"
                      >
                        <SubjectIcon className={classes.commitControlIcon} />
                        Docs
                      </Button>
                    ) : (
                      <Button
                        className={classes.commitCompareButton}
                        component={Link}
                        variant="text"
                        to={changelogPage.linkTo(batchCommit.batchId)}
                      >
                        <CompareArrowsIcon
                          className={classes.commitControlIcon}
                        />
                        Compare
                      </Button>
                    )}

                    {!isCurrent && appConfig.allowEditing && (
                      <Button
                        className={classes.commitResetButton}
                        variant="outlined"
                        onClick={() => {
                          setConfirmResetModalState(batchCommit);
                        }}
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      </Page.Body>
      {confirmResetModalState && (
        <ConfirmResetModal
          batchCommit={confirmResetModalState}
          onClose={() => setConfirmResetModalState(false)}
          onSave={() => {
            const numberOfCommitsReset = batchCommits.findIndex(
              (batchCommit) =>
                batchCommit.batchId === confirmResetModalState.batchId
            );
            analytics.resetToCommit(numberOfCommitsReset);
          }}
        />
      )}
    </Page>
  );
};

const useStyles = makeStyles((theme) => ({
  pageBody: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    ...theme.mixins.gutters(),
  },

  changelogSection: {
    display: 'flex',
    maxWidth: theme.breakpoints.values.md,
    marginTop: theme.spacing(4),
    flexGrow: 1,
  },

  changelogTimeline: {
    borderLeft: `2px solid ${theme.palette.grey[200]}`,
    paddingRight: theme.spacing(1),
    flexShrink: 0,
  },
  changelogIcon: {
    marginLeft: theme.spacing(-1.5) - 1,
    paddingBottom: theme.spacing(1),
    background: theme.palette.background.default,
    boxSizing: 'content-box',
    fontSize: theme.spacing(3),
    color: theme.palette.grey[400],
  },

  commitsList: {
    // this is a reset that re-occurs alot when using semantic ul and ol. probably
    // worth extracting into a mixin
    listStyleType: 'none',
    paddingLeft: 0,
    marginTop: theme.spacing(3) + theme.spacing(1), // clock height + it's bottom spacing
    maxWidth: '100%',

    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  commitsListItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',

    background: '#fff',
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.grey[200]}`,
    color: Color(theme.palette.text.secondary).darken(0.3).hsl().string(),

    '&$isCurrent': {
      margin: theme.spacing(0, -0.5, 3),
      border: `1px solid ${Color(theme.palette.primary.light)
        .lighten(0.7)
        .hex()}`,
      background: Color(LightBlueBackground).lighten(0.03).hex(),
      fontSize: theme.typography.pxToRem(theme.typography.fontSize + 3),
    },
  },

  isCurrent: {}, // state definition, so a classname is generated for it

  commitDetails: {
    display: 'flex',
    flexDirection: 'column',
    margin: 0,

    '& h4': {},
  },

  commitMessage: {
    margin: 0,
  },
  commitTime: {
    fontSize: theme.typography.pxToRem(theme.typography.fontSize - 2),
  },

  commitControls: {
    display: 'flex',
    flexShrink: 0,
    flexGrow: 0,
    flexDirection: 'row-reverse',
    marginLeft: theme.spacing(1),

    '& > *:nth-child(n + 2)': {
      // all but the first child
      marginRight: theme.spacing(1),
    },
  },
  commitCompareButton: {
    ...button(),
  },
  commitDocsButton: {
    ...button(),

    background: '#fff',
  },

  commitResetButton: {
    ...button('outlined'),
  },

  commitControlIcon: {
    width: theme.spacing(2),
    marginRight: theme.spacing(0.5),
  },
}));

function button(variant?: 'outlined'): CSSProperties {
  return {
    fontFamily: FontFamily,
    color: OpticBlueReadable,
    textTransform: 'none',

    ...(variant === 'outlined'
      ? {
          border: `1px solid ${LightBlueBackground}`,
        }
      : {
          background: LightBlueBackground,
        }),
  };
}

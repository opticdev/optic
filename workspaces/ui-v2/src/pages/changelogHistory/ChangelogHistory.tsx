import React, { FC } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Schedule as ScheduleIcon } from '@material-ui/icons';

import { Button } from '@material-ui/core';

import {
  Page,
  useChangelogPages,
  useDocumentationPageLink,
} from '<src>/components';
import { useBatchCommits } from '<src>/hooks/useBatchCommits';
import { formatTimeAgo } from '<src>/utils';

export const ChangelogHistory: FC = () => {
  const { loading, batchCommits } = useBatchCommits();
  const changelogPage = useChangelogPages();
  const documentationPage = useDocumentationPageLink();

  const classes = useStyles();

  return (
    <Page>
      <Page.Navbar />
      <Page.Body padded className={classes.pageBody} loading={loading}>
        <section className={classes.changelogSection}>
          <div className={classes.changelogTimeline}>
            <ScheduleIcon className={classes.changelogIcon} />
          </div>

          <ol className={classes.commitsList}>
            {batchCommits.map((batchCommit, i) => (
              <li className={classes.commitsListItem} key={batchCommit.batchId}>
                <div className={classes.commitDetails}>
                  <h4 className={classes.commitMessage}>
                    {batchCommit.commitMessage}
                  </h4>
                  <span className={classes.commitTime}>
                    {formatTimeAgo(new Date(batchCommit.createdAt))}
                  </span>
                </div>

                <div className={classes.commitControls}>
                  <Button
                    className={classes.commitCompareButton}
                    href={
                      i === 0
                        ? documentationPage.linkTo()
                        : changelogPage.linkTo(batchCommit.batchId)
                    }
                  >
                    Compare
                  </Button>

                  {i !== 0 && (
                    <Button
                      className={classes.commitResetButton}
                      onClick={() => {
                        console.log(`resetting to ${batchCommit.batchId}`);
                      }}
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      </Page.Body>
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
  },

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
  },
  commitCompareButton: {},
  commitResetButton: {},
}));

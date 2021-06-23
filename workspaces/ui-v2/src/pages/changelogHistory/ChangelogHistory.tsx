import React, { FC, useState } from 'react';
import { Button, makeStyles } from '@material-ui/core';
import { Schedule as ScheduleIcon } from '@material-ui/icons';
import { useHistory } from 'react-router-dom';

import {
  Page,
  useChangelogPages,
  useDocumentationPageLink,
} from '<src>/components';
import { BatchCommit, useBatchCommits } from '<src>/hooks/useBatchCommits';
import { formatTimeAgo } from '<src>/utils';

import { ConfirmResetModal } from './components';

const SPECIFICATION_METADATA_COMMIT_MESSAGE =
  'Initialize specification attributes';
const canShowResetButton = (commitMessage: string, index: number) =>
  commitMessage !== SPECIFICATION_METADATA_COMMIT_MESSAGE && index !== 0;

export const ChangelogHistory: FC = () => {
  const { loading, batchCommits } = useBatchCommits();
  const changelogPage = useChangelogPages();
  const documentationPage = useDocumentationPageLink();
  const history = useHistory();
  const classes = useStyles();
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
                    onClick={() =>
                      history.push(
                        i === 0
                          ? documentationPage.linkTo()
                          : changelogPage.linkTo(batchCommit.batchId)
                      )
                    }
                  >
                    {i === 0 ? 'View' : 'Compare'}
                  </Button>

                  {canShowResetButton(batchCommit.commitMessage, i) && (
                    <Button
                      className={classes.commitResetButton}
                      onClick={() => {
                        setConfirmResetModalState(batchCommit);
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
      {confirmResetModalState && (
        <ConfirmResetModal
          batchCommit={confirmResetModalState}
          onClose={() => setConfirmResetModalState(false)}
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

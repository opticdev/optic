import React, { FC } from 'react';
import { useHistory } from 'react-router-dom';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/core/styles';

import {
  Link, // this should probably be one of our own global components
} from '@material-ui/core';

import {
  Page,
  useChangelogPages,
  useDocumentationPageLink,
} from '<src>/components';
import { useBatchCommits } from '<src>/hooks/useBatchCommits';
import { useSpacingStyles, useUtilityStyles } from '<src>/styles';
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
          <h1>Changelog</h1>
          <ol className={classes.commitsList}>
            {batchCommits.map((batchCommit, i) => (
              <li className={classes.commitsListItem} key={batchCommit.batchId}>
                <Link
                  className={classes.commitLink}
                  href={
                    i === 0
                      ? documentationPage.linkTo()
                      : changelogPage.linkTo(batchCommit.batchId)
                  }
                >
                  <h4 className={classes.commitMessage}>
                    {batchCommit.commitMessage}
                  </h4>
                  <span className={classes.commitTime}>
                    {formatTimeAgo(new Date(batchCommit.createdAt))}
                  </span>
                </Link>
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
    flexDirection: 'column',
    flexGrow: 1,
  },

  commitsList: {
    // this is a reset that re-occurs alot when using semantic ul and ol. probably
    // worth extracting into a mixin
    listStyleType: 'none',
    paddingLeft: 0,

    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  commitsListItem: {},

  commitLink: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  commitMessage: {},
  commitTime: {},
}));

import React, { FC } from 'react';
import { useHistory } from 'react-router-dom';
import classNames from 'classnames';

import { Page, useChangelogPages } from '<src>/components';
import { useBatchCommits } from '<src>/hooks/useBatchCommits';
import { useSpacingStyles, useUtilityStyles } from '<src>/styles';

export const ChangelogHistory: FC = () => {
  const containerSpacing = useSpacingStyles({
    size: 3,
  });
  const batchCommitSpacing = useSpacingStyles({});
  const utilityStyles = useUtilityStyles({});
  const { loading, batchCommits } = useBatchCommits();
  const changelogPages = useChangelogPages();
  const history = useHistory();

  return (
    <Page>
      <Page.Navbar />
      <Page.Body
        padded
        className={containerSpacing.padding}
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
        loading={loading}
      >
        <h1>Changelog</h1>
        <div style={{ width: 800, display: 'flex', flexDirection: 'column' }}>
          {batchCommits.map((batchCommit) => (
            <div
              className={classNames(
                batchCommitSpacing.padding,
                utilityStyles.link
              )}
              style={{
                cursor: 'pointer',
              }}
              key={batchCommit.batchId}
              onClick={() =>
                history.push(changelogPages.linkTo(batchCommit.batchId))
              }
            >
              <h2>{batchCommit.commitMessage}</h2>
              <p>{batchCommit.batchId}</p>
              <p>{batchCommit.createdAt}</p>
            </div>
          ))}
        </div>
      </Page.Body>
    </Page>
  );
};

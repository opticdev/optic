import React, { FC } from 'react';
import { useHistory } from 'react-router-dom';
import classNames from 'classnames';

import {
  Page,
  useChangelogPages,
  useDocumentationPageLink,
} from '<src>/components';
import { useBatchCommits } from '<src>/hooks/useBatchCommits';
import { useSpacingStyles, useUtilityStyles } from '<src>/styles';
import { formatTimeAgo } from '<src>/utils';

export const ChangelogHistory: FC = () => {
  const containerSpacing = useSpacingStyles({
    size: 3,
  });
  const batchCommitSpacing = useSpacingStyles({});
  const utilityStyles = useUtilityStyles({});
  const { loading, batchCommits } = useBatchCommits();
  const changelogPage = useChangelogPages();
  const documentationPage = useDocumentationPageLink();
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
          {batchCommits.map((batchCommit, i) => (
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
                history.push(
                  i === 0
                    ? documentationPage.linkTo()
                    : changelogPage.linkTo(batchCommit.batchId)
                )
              }
            >
              <h4>{batchCommit.commitMessage}</h4>
              <p>{formatTimeAgo(new Date(batchCommit.createdAt))}</p>
            </div>
          ))}
        </div>
      </Page.Body>
    </Page>
  );
};

import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import { OpticBlueReadable } from '<src>/styles';
import { Button, LinearProgress, Typography } from '@material-ui/core';
import { useSharedDiffContext } from '<src>/pages/diffs/contexts/SharedDiffContext';
import {
  useDiffReviewCapturePageLink,
  useDiffUndocumentedUrlsPageLink,
} from '<src>/components';
import AskForCommitMessage from './AskForCommitMessage';

export function DiffAccessoryNavigation() {
  const classes = useStyles();

  const {
    handledCount,
    hasDiffChanges,
    getUndocumentedUrls,
    wipPatterns,
  } = useSharedDiffContext();
  const diffReviewCapturePage = useDiffReviewCapturePageLink();
  const undocumentedUrlsPageLink = useDiffUndocumentedUrlsPageLink();
  const history = useHistory();
  const [handled, total] = handledCount;
  const hasChanges =
    hasDiffChanges() ||
    Object.values(wipPatterns).filter((pattern) => pattern.isParameterized)
      .length > 0;

  const numberOfUndocumented = getUndocumentedUrls().filter((i) => !i.hide)
    .length;

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div className={classes.content} style={{ marginRight: 10 }}>
        <Typography
          variant="overline"
          className={classes.counter}
          style={{ lineHeight: 1.5 }}
        >
          {handled}/{total} diffs handled
        </Typography>
        <LinearProgress
          style={{ width: 150, height: 3 }}
          value={(handled / total) * 100}
          variant="determinate"
        />
      </div>
      <div className={classes.content}>
        <div className={classes.counter} style={{ marginRight: 10 }}>
          <Button
            size="small"
            disableRipple
            color="primary"
            onClick={() => {
              history.push(diffReviewCapturePage.linkTo());
            }}
          >
            {' '}
            Show Remaining Diffs ({total - handled})
          </Button>

          <Button
            size="small"
            disableRipple
            color="primary"
            onClick={() => {
              history.push(undocumentedUrlsPageLink.linkTo());
            }}
          >
            {' '}
            Show Undocumented URLs ({numberOfUndocumented})
          </Button>
        </div>
      </div>
      <div className={classes.content}>
        <div className={classes.counter} style={{ marginRight: 10 }}>
          <AskForCommitMessage hasChanges={hasChanges} />
        </div>
      </div>
    </div>
  );
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: 'transparent',
    maxWidth: 800,
  },
  counter: {
    color: OpticBlueReadable,
    fontFamily: 'Ubuntu Mono',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

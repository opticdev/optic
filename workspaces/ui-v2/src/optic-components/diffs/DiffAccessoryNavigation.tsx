import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import { OpticBlueReadable } from '../theme';
import { Button, LinearProgress, Typography } from '@material-ui/core';
import { useSharedDiffContext } from '../hooks/diffs/SharedDiffContext';
import {
  useDiffReviewCapturePageLink,
  useDiffUndocumentedUrlsPageLink,
} from '../navigation/Routes';
import AskForCommitMessage from './render/AskForCommitMessage';

type DiffAccessoryNavigationProps = {};

export function DiffAccessoryNavigation({}: DiffAccessoryNavigationProps) {
  const classes = useStyles();

  const { context, handledCount } = useSharedDiffContext();
  const diffReviewCapturePage = useDiffReviewCapturePageLink();
  const undocumentedUrlsPageLink = useDiffUndocumentedUrlsPageLink();
  const history = useHistory();
  const [handled, total] = handledCount;

  const hasChanges =
    handled > 0 || context.pendingEndpoints.filter((i) => i.staged).length > 0;

  const numberOfUndocumented = context.results?.displayedUndocumentedUrls.filter(
    (i) => !i.hide
  ).length;

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

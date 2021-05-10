import React from 'react';
import { makeStyles } from '@material-ui/styles';
import CompareArrowsIcon from '@material-ui/icons/CompareArrows';
import { ToggleButton } from '@material-ui/lab';
import { Box, Typography } from '@material-ui/core';
import Menu from '@material-ui/core/Menu';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import MenuItem from '@material-ui/core/MenuItem';
import { BatchCommit, useBatchCommits } from '../hooks/useBatchCommits';
import { useBaseUrl } from '../hooks/useBaseUrl';
import { OpticBlue, OpticBlueReadable } from '../theme';
// @ts-ignore
import TimeAgo from 'javascript-time-ago';
// @ts-ignore
import en from 'javascript-time-ago/locale/en';

TimeAgo.addLocale(en);
const timeAgo = new TimeAgo('en-US');

export function ChangesSinceDropdown(props: any) {
  const classes = useStyles();
  const history = useHistory();
  const batchCommits = useBatchCommits();
  const baseUrl = useBaseUrl();
  const { pathname } = useLocation();
  const allBatchCommits = batchCommits.batchCommits;
  const { batchId } = useParams<{ batchId?: string }>();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const selectedBatchId =
    batchId && allBatchCommits.find((i) => i.batchId.startsWith(batchId));

  const content =
    batchId && selectedBatchId ? (
      <Typography variant="body2" style={{ textTransform: 'none' }}>
        Latest...{selectedBatchId.batchId.substr(0, 8)}
      </Typography>
    ) : (
      <Typography variant="body2" style={{ textTransform: 'none' }}>
        Compare Versions
      </Typography>
    );

  return (
    <>
      <ToggleButton
        value="check"
        selected={false}
        size="small"
        className={classes.button}
        onClick={handleClick}
        style={{ marginRight: 10 }}
      >
        {content}
        <CompareArrowsIcon style={{ marginLeft: 3, height: 14 }} />
      </ToggleButton>
      <Menu
        elevation={1}
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        style={{ marginTop: 20 }}
      >
        {allBatchCommits.map((i, index) => (
          <MenuItem
            key={i.batchId}
            onClick={() => {
              const pathMatch = pathname.match(
                /(changes-since\/[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}|documentation)(.*)/
              );
              if (!pathMatch) {
                return console.error('ERROR');
              }
              const currentRelativePath = pathMatch[2];
              if (index === 0) {
                history.push(`${baseUrl}/documentation${currentRelativePath}`);
              } else {
                history.push(
                  `${baseUrl}/changes-since/${i.batchId}${currentRelativePath}`
                );
              }
            }}
          >
            <BatchCommitMenuItem
              batch={index === 0 ? { ...i, commitMessage: 'Latest' } : i}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

function BatchCommitMenuItem({ batch }: { batch: BatchCommit }) {
  const name =
    batch.commitMessage &&
    (batch.commitMessage.split('\n')[0] ||
      `API  ${batch.commitMessage.split('\n').length}  changes`);
  return (
    <Box display="flex" flexDirection="column">
      <Typography
        component="span"
        variant="subtitle1"
        style={{
          fontFamily: 'Ubuntu Mono',
          fontSize: 16,
          color: OpticBlue,
        }}
      >
        {name || 'Changes from'}
      </Typography>
      <Typography
        component="span"
        variant="subtitle1"
        style={{
          fontFamily: 'Ubuntu Mono',
          fontSize: 12,
          marginTop: -7,
          color: OpticBlueReadable,
        }}
      >
        {batch.createdAt && timeAgo.format(new Date(batch.createdAt))}
      </Typography>
    </Box>
  );
}

const useStyles = makeStyles((theme) => ({
  button: {
    height: 25,
    paddingRight: 5,
  },
  scroll: {
    overflow: 'scroll',
    flex: 1,
  },
}));

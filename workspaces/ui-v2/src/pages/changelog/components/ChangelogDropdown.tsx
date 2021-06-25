import React from 'react';
import { makeStyles } from '@material-ui/styles';
import CompareArrowsIcon from '@material-ui/icons/CompareArrows';
import { ToggleButton } from '@material-ui/lab';
import { Box, Typography } from '@material-ui/core';
import Menu from '@material-ui/core/Menu';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import MenuItem from '@material-ui/core/MenuItem';
import { BatchCommit, useBatchCommits } from '<src>/hooks/useBatchCommits';
import { useChangelogHistoryPage } from '<src>/components/navigation/Routes';
import { useBaseUrl } from '<src>/hooks/useBaseUrl';
import { OpticBlue, OpticBlueReadable } from '<src>/styles';
import { formatTimeAgo } from '<src>/utils';

export function ChangesSinceDropdown() {
  const classes = useStyles();
  const history = useHistory();
  const batchCommits = useBatchCommits();
  const baseUrl = useBaseUrl();
  const { pathname } = useLocation();
  const shownBatchCommits = batchCommits.batchCommits.slice(0, 5);
  const { batchId } = useParams<{ batchId?: string }>();
  const changelogHistoryPage = useChangelogHistoryPage();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const selectedBatchId =
    batchId &&
    batchCommits.batchCommits.find((i) => i.batchId.startsWith(batchId));

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
        {shownBatchCommits.length > 0 ? (
          <>
            {shownBatchCommits.map((i, index) => (
              <MenuItem
                key={i.batchId}
                onClick={() => {
                  const pathMatch = pathname.match(
                    /(changes-since\/[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}|documentation)(.*)/
                  );
                  const currentRelativePath =
                    pathMatch && pathMatch[2] ? pathMatch[2] : '';
                  if (index === 0) {
                    history.push(
                      `${baseUrl}/documentation${currentRelativePath}`
                    );
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
            {batchCommits.batchCommits.length > 5 && (
              <MenuItem
                key="show-all-commits"
                onClick={() => {
                  history.push(changelogHistoryPage.linkTo());
                }}
              >
                <Typography
                  component="span"
                  variant="subtitle1"
                  style={{
                    fontFamily: 'Ubuntu Mono',
                    fontSize: 14,
                    color: OpticBlueReadable,
                  }}
                >
                  See all changes
                </Typography>
              </MenuItem>
            )}
          </>
        ) : (
          <MenuItem>
            <Box>
              <Typography
                component="span"
                variant="subtitle1"
                style={{
                  fontFamily: 'Ubuntu Mono',
                  fontSize: 14,
                  color: OpticBlueReadable,
                }}
              >
                No versions were found
              </Typography>
            </Box>
          </MenuItem>
        )}
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
        {batch.createdAt && formatTimeAgo(new Date(batch.createdAt))}
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

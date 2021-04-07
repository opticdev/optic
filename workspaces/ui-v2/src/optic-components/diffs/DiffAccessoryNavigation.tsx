import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { useHistory, useParams } from 'react-router-dom';
import { EndpointName } from '../documentation/EndpointName';
import { AddedDarkGreen, OpticBlueReadable } from '../theme';
import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@material-ui/core';
import { useSharedDiffContext } from '../hooks/diffs/SharedDiffContext';
import {
  useDiffForEndpointLink,
  useDiffUndocumentedUrlsPageLink,
} from '../navigation/Routes';

type DiffAccessoryNavigationProps = {
  onUrlsPage?: boolean;
};

export function DiffAccessoryNavigation({
  onUrlsPage = false,
}: DiffAccessoryNavigationProps) {
  const classes = useStyles();

  const { context, isDiffHandled } = useSharedDiffContext();
  const diffsGroupedByEndpoints = context.results.diffsGroupedByEndpoint;
  const diffUndocumentedUrlsPageLink = useDiffUndocumentedUrlsPageLink();
  const diffForEndpointLink = useDiffForEndpointLink();
  const params = useParams<{ pathId?: string; method?: string }>();
  const history = useHistory();

  const { pathId, method } = params;

  const value = onUrlsPage
    ? 0
    : 1 +
      diffsGroupedByEndpoints.findIndex(
        (i) => i.pathId === pathId && method === i.method
      );

  const hasChanges = false;

  const handleChangeToUndocumentedUrlPage = () => {
    history.push(diffUndocumentedUrlsPageLink.linkTo());
  };

  const handleChangeToEndpointPage = (
    pathId: string,
    method: string,
    tabIndex: number
  ) => () => {
    history.push(diffForEndpointLink.linkTo(pathId, method));
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div className={classes.root}>
        <Tabs
          value={value}
          classes={{ root: classes.tabsRoot }}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="on"
          disableRipple
          aria-label="scrollable auto tabs example"
        >
          <UndocumentedTab
            onClick={handleChangeToUndocumentedUrlPage}
            numberOfUndocumented={
              context.results.displayedUndocumentedUrls.length
            }
            done={false}
          />
          {diffsGroupedByEndpoints.map((i, index) => (
            <EndpointChangedTab
              key={index + 1}
              onClick={handleChangeToEndpointPage(
                i.pathId,
                i.method,
                index + 1
              )}
              value={index + 1}
              method={i.method}
              fullPath={i.fullPath}
              diffCount={i.newRegionDiffs.length + i.shapeDiffs.length}
              diffCompletedCount={
                i.shapeDiffs.filter((i) => isDiffHandled(i.diffHash())).length
              }
            />
          ))}
        </Tabs>
      </div>
      <div className={classes.finishedButtons}>
        {hasChanges && (
          <Button
            variant="contained"
            size="small"
            color="primary"
            style={{ fontSize: 10 }}
          >
            Save Changes
          </Button>
        )}
        <ExtraDiffOptions />
      </div>
    </div>
  );
}

type IEndpointChangedTabProps = {
  method: string;
  fullPath: string;
  diffCount: number;
  diffCompletedCount: number;
  value: number;
  onClick: any;
};

function EndpointChangedTab({
  method,
  fullPath,
  diffCount,
  diffCompletedCount,
  value,
  onClick,
}: IEndpointChangedTabProps) {
  const classes = useStyles();

  const done = diffCompletedCount === diffCount;
  const remaining = diffCount - diffCompletedCount;
  return (
    <Tab
      classes={{ wrapper: classes.tabWrapper }}
      className={classes.tabRoot}
      disableRipple={true}
      onClick={onClick}
      label={
        <div className={classes.tabInner}>
          <EndpointName
            method={method}
            fullPath={fullPath}
            fontSize={8}
            leftPad={0}
          />
          {done ? (
            <div className={classes.text} style={{ color: AddedDarkGreen }}>
              Done! {diffCount} reviewed
            </div>
          ) : (
            <div className={classes.text}>
              {remaining} diff{remaining === 1 ? '' : 's'} to review
            </div>
          )}
        </div>
      }
    />
  );
}

type IUndocumentedTabProps = {
  numberOfUndocumented: number;
  done: boolean;
  onClick: any;
};

function UndocumentedTab({
  numberOfUndocumented,
  onClick,
  done,
}: IUndocumentedTabProps) {
  const classes = useStyles();
  return (
    <Tab
      disableRipple={true}
      classes={{ wrapper: classes.tabWrapper }}
      className={classes.tabRoot}
      onClick={onClick}
      label={
        <div className={classes.tabInner}>
          <div style={{ fontSize: 8, color: OpticBlueReadable }}>
            Undocumented URLs observed
          </div>
          {done ? (
            <div className={classes.text} style={{ color: AddedDarkGreen }}>
              Done! 16 endpoints added
            </div>
          ) : (
            <div className={classes.text}>
              {numberOfUndocumented} urls to review
            </div>
          )}
        </div>
      }
    />
  );
}

const tabHeight = 33;
const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: 'transparent',
    maxWidth: 800,
  },
  tabsRoot: {
    minHeight: tabHeight,
    height: tabHeight,
  },
  text: {
    textTransform: 'none',
    marginTop: -3,
  },
  tabRoot: {
    minHeight: tabHeight,
    height: tabHeight,
    fontSize: 10,
    padding: 0,
    marginRight: 4,
    minWidth: 10,
  },
  tabInner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContents: 'center',
    paddingRight: 9,
    paddingLeft: 3,
    textTransform: 'none',
  },
  tabWrapper: {
    alignItems: 'flex-start',
    paddingLeft: 0,
  },
  finishedButtons: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

function ExtraDiffOptions() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const iconSize = { height: 18, width: 18 };
  return (
    <div style={{ marginRight: 5 }}>
      <IconButton onClick={handleClick} style={iconSize}>
        <MoreVertIcon style={iconSize} />
      </IconButton>
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={handleClose}>
          <Typography variant="body2">Reset</Typography>
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <Typography variant="body2">Approve All (Extend Baseline)</Typography>
        </MenuItem>
      </Menu>
    </div>
  );
}

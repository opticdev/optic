import React, { useState } from 'react';
import theme from '../../decorators/theme';
import card from '../../decorators/card';
import { EndpointReport } from '../../../components/testing/EndpointReport';
import Page from '../../../components/Page';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import { Divider, IconButton, ListSubheader } from '@material-ui/core';
import ListItem from '@material-ui/core/ListItem';
import MenuOpenIcon from '@material-ui/icons/MenuOpen';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import {
  PathAndMethod,
  PathAndMethodLarge,
  PathAndMethodMono,
  PathAndMethodOverflowFriendly,
} from '../../../components/diff/v2/PathAndMethod';
import { primary, secondary, SubtleBlueBackground } from '../../../theme';
import { dummyData } from './dummy-data';
import Typography from '@material-ui/core/Typography';
import { CoverageDots } from './CoverageDots';
import { DiffCounter } from './DiffCounter';
import Checkbox from '@material-ui/core/Checkbox';
import Zoom from '@material-ui/core/Zoom';
import { HardCodedDiffExamples } from '../../../components/diff/v2/shape_viewers/DiffReviewTypes';
import { Code, DiffSummaryRegion } from './DiffSummaryRegion';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import Box from '@material-ui/core/Box';
import { DocDarkGrey } from '../../../components/docs/DocConstants';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

export default {
  title: 'Diff Page/Summary',
  decorators: [theme],
};

export function DiffPageUI() {
  const classes = useStyles();
  //this will be a context eventually...
  const [selected, setSelected] = useState(null);

  const NiceSubheader = ({ title, count }) => (
    <ListSubheader
      disableGutters
      style={{
        paddingLeft: 10,
        fontFamily: 'Ubuntu Mono',
        backgroundColor: SubtleBlueBackground,
      }}
    >{`${title} (${count})`}</ListSubheader>
  );
  return (
    <Page.Body padded={false} style={{ flexDirection: 'row', height: '100vh' }}>
      <Paper square className={classes.left} elevation={4}>
        <DiffInfoCard />
        <List className={classes.list}>
          <NiceSubheader title={'Endpoints with Diffs'} count={12} />
          {dummyData
            .filter((i) => i.hasDiff)
            .map((i) => (
              <EndpointDetailCard {...i} {...{ selected, setSelected }} />
            ))}
          <NiceSubheader title={'Endpoints with Traffic Coverage'} count={3} />
          {dummyData
            .filter((i) => !i.hasDiff && i.hasCoverage)
            .map((i) => (
              <EndpointDetailCard {...i} {...{ selected, setSelected }} />
            ))}
          <NiceSubheader
            title={'Endpoints without Traffic Coverage'}
            count={2}
          />
          {dummyData
            .filter((i) => !i.hasCoverage)
            .map((i) => (
              <EndpointDetailCard {...i} {...{ selected, setSelected }} />
            ))}
        </List>
        <Divider />

        <Paper className={classes.undocumented} square>
          <Typography variant="subtitle1">
            <Code>15</Code> undocumented urls
            <Button
              color="primary"
              size="medium"
              style={{ marginLeft: 10, marginTop: -1 }}
            >
              {' '}
              Start Documenting
            </Button>
          </Typography>
        </Paper>
      </Paper>
      <div className={classes.right}>
        {HardCodedDiffExamples.map((i, index) => {
          return <DiffSummaryRegion diff={i} key={index} />;
        })}
      </div>
    </Page.Body>
  );
}

export function EndpointDetailCard(props) {
  const {
    method,
    hasDiff,
    fullPath,
    id,
    stats,
    name,
    selected,
    setSelected,
  } = props;
  const classes = useStyles();
  const handled = stats.handled && hasDiff;
  return (
    <ListItem
      classes={{
        selected: classes.selected,
        root: handled ? classes.listItemHandled : classes.listItemRoot,
      }}
      button
      key={id}
      selected={id === selected}
      onClick={() => setSelected(id)}
      disableGutters
      divider={true}
      style={{ backgroundColor: handled || !hasDiff ? '#f3f3f3' : 'white' }}
    >
      <div className={classes.listInner}>
        <div className={classes.endpointDescriptor}>
          <PathAndMethodMono path={fullPath} method={method} />
          <Typography variant="caption" className={classes.name}>
            {name}
          </Typography>
        </div>
        <div style={{ flex: 1 }} />
        <div className={classes.rightAction}>
          <div className={classes.stats}>
            <CoverageDots
              requests={props.requests}
              responses={props.responses}
            />
            {!handled && <DiffCounter {...stats} />}
          </div>
        </div>
      </div>
    </ListItem>
  );
}

const DiffInfoCard = (props) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className={classes.info}>
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        style={{ paddingTop: 10, paddingLeft: 10, paddingRight: 10 }}
      >
        <div style={{ flex: 1 }}>
          Diffs Since Last Commit <Code>e2rff34</Code> on{' '}
          <Code>feature/new-thing</Code>
        </div>
        <div style={{ paddingLeft: 15 }}>
          <IconButton size="small" onClick={handleClick}>
            <MenuOpenIcon style={{ width: 20, height: 20 }} />
          </IconButton>
        </div>
        <Menu
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleClose}>Restart Diff Review</MenuItem>
          <MenuItem onClick={handleClose}>Clear Capture</MenuItem>
          <MenuItem onClick={handleClose}>Switch Capture Mode</MenuItem>
        </Menu>
      </Box>
      <Box
        flexDirection="row"
        display="flex"
        alignItems="center"
        style={{ marginTop: 5, paddingLeft: 10, paddingRight: 10 }}
      >
        <div style={{ fontSize: 10, color: DocDarkGrey, marginRight: 10 }}>
          You have handled 4/8 Diffs
        </div>
        <LinearProgress
          value={50}
          variant="determinate"
          style={{ flex: 1, maxWidth: 100 }}
        />
      </Box>
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  left: {
    width: 450,
    height: '100%',
    backgroundColor: SubtleBlueBackground,
    overflow: 'scroll',
    display: 'flex',
    flexDirection: 'column',
  },
  right: {
    minWidth: 550,
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 10,
    overflow: 'scroll',
  },
  listInner: {
    padding: 9,
    paddingTop: 1,
    paddingBottom: 1,
    height: 50,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
  },
  endpointDescriptor: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  stats: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  name: {
    marginTop: 3,
    fontWeight: 500,
    fontSize: 14,
  },
  listItemRoot: {
    borderRightWidth: 0,
  },
  listItemHandled: {
    borderRight: `4px solid ${primary}`,
  },
  list: {
    flex: 1,
    overflow: 'scroll',
    paddingTop: 0,
  },
  rightAction: {
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center',
  },
  undocumented: {
    height: 75,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    fontFamily: 'Ubuntu Mono',
    paddingBottom: 0,
    fontSize: 12,
  },
  selected: {
    borderRight: `4px solid ${secondary}`,
    transition: 'border-width 0.1s ease-in-out',
  },
}));

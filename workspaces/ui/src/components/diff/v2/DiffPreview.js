import React, { useContext, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { DocDarkGrey } from '../../docs/DocConstants';
import {
  Button,
  CardActions,
  Checkbox,
  Collapse,
  ListItemAvatar,
} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import MenuOpenIcon from '@material-ui/icons/MenuOpen';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import {
  CompareEquality,
  filterScala,
  getOrUndefined,
  headOrUndefined,
  JsonHelper,
  lengthScala,
  mapScala,
} from '@useoptic/domain';
import { DiffContext, withDiffContext } from './DiffContext';
import {
  AddedGreenBackground,
  ChangedYellowBackground,
  RemovedRedBackground,
  UpdatedBlue,
} from '../../../theme';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Card from '@material-ui/core/Card';
import IconButton from '@material-ui/core/IconButton';
import { PulsingOptic } from './DiffHelperCard';
import { DiffToolTip } from './shape_viewers/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  blur: {
    opacity: 0.3,
    pointerEvents: 'none',
  },
  header: {
    paddingLeft: 20,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 5,
    fontWeight: 800,
  },
  hunkHeader: {
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    color: '#25292e',
    minHeight: 40,
    backgroundColor: '#eaebff',
    fontWeight: 800,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'start',
    justifyContent: 'start',
  },
  location: {
    marginLeft: 12,
  },
  diff: {
    fontSize: 12,
    fontWeight: 600,
    color: '#f8333c',
    marginLeft: 11,
    flex: 1,
    paddingLeft: 30,
  },
  crumb: {
    fontSize: 12,
    textTransform: 'uppercase',
  },
  heading: {
    fontSize: theme.typography.pxToRem(17),
    padding: 0,
    fontWeight: theme.typography.fontWeightRegular,
  },
  wrapper: {
    overflow: 'hidden',
    borderLeft: `3px solid ${UpdatedBlue}`,
  },
  hunk: {
    backgroundColor: 'white',
    minHeight: 300,
  },
  subheader: {
    fontWeight: 100,
    paddingBottom: 0,
    marginBottom: 0,
    height: 33,
  },
  diffsNewRegion: {
    display: 'flex',
    flexDirection: 'row',
    paddingLeft: 5,
    maxWidth: 670,
  },
  diffCursor: {
    position: 'sticky',
    top: 0,
    zIndex: 500,
    paddingTop: 10,
    paddingBottom: 10,
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
    borderLeft: `3px solid ${UpdatedBlue}`,
  },
  diffTitle: {
    fontSize: 19,
    fontWeight: 400,
    paddingLeft: 11,
  },
  diffCursorActions: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
  },
  diffItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'baseline',
    paddingLeft: 5,
  },
}));
const addition = (
  <FiberManualRecordIcon
    style={{ width: '.7em', height: '.7em', color: AddedGreenBackground }}
  />
);

const update = (
  <FiberManualRecordIcon
    style={{ width: '.7em', height: '.7em', color: ChangedYellowBackground }}
  />
);

const removal = (
  <FiberManualRecordIcon
    style={{ width: '.7em', height: '.7em', color: RemovedRedBackground }}
  />
);

export function DiffCursor(props) {
  const classes = useStyles();
  const { diffs } = props;
  const diffCount = lengthScala(diffs);

  const { selectedDiff, setSelectedDiff } = useContext(DiffContext);

  const [showAllDiffs, setShowAllDiffs] = useState(false);

  useEffect(() => {
    if (selectedDiff === null && diffCount > 0) {
      setSelectedDiff(headOrUndefined(diffs));
      setShowAllDiffs(false);
    }
  }, [selectedDiff, diffCount]);

  try {
    console.log('diff ' + selectedDiff.diff);
  } catch (e) {}

  const DiffItem = ({ diff, button }) => {
    return (
      <ListItem
        button={button}
        className={classes.diffItem}
        onClick={() => {
          setSelectedDiff(diff);
          setShowAllDiffs(false);
        }}
      >
        <Typography variant="h5" className={classes.diffTitle}>
          {diff.description.title}
        </Typography>
        <BreadcumbX location={JsonHelper.seqToJsArray(diff.location)} />
      </ListItem>
    );
  };

  if (!selectedDiff && diffCount === 0) {
    return null;
  }

  return (
    <Card className={classes.diffCursor} elevation={3}>
      <div style={{ flex: 1 }}>
        {!showAllDiffs && selectedDiff && (
          <DiffItem button={false} diff={selectedDiff} />
        )}
        <Collapse in={showAllDiffs}>
          <Typography variant="subtitle2" style={{ paddingLeft: 12 }}>
            Choose a diff to review
          </Typography>
          <List>
            {mapScala(diffs)((diff, n) => <DiffItem key={n} diff={diff} button={true} />)}
          </List>
        </Collapse>
      </div>
      {!showAllDiffs && (
        <div className={classes.diffCursorActions}>
          <Typography
            variant="overline"
            style={{ color: DocDarkGrey, marginRight: 10 }}
          >
            {diffCount} diffs
          </Typography>
          <DiffToolTip title="See all Diffs">
            <IconButton
              color="primary"
              disabled={diffCount <= 1}
              onClick={() => setShowAllDiffs(true)}
            >
              <MenuOpenIcon />
            </IconButton>
          </DiffToolTip>
        </div>
      )}
    </Card>
  );
}

export default function DiffPreview() {
  const classes = useStyles();

  return (
    <Paper className={classes.wrapper} elevation={2}>
      <div className={classes.header}>
        <Typography style={{ marginLeft: 11 }} variant="subtitle2">
          The Field X was added
        </Typography>
        <div style={{ flex: 1 }} />
        {addition}
        {update}
        {removal}
        <Button style={{ marginLeft: 5 }}>Resolve</Button>
      </div>
      <div className={classes.diffs}>
        <div className={classes.hunk}>
          <div className={classes.hunkHeader}>
            <Typography
              style={{ marginLeft: 11, fontSize: 11, fontWeight: 200 }}
              variant="subtitle2"
            >
              Request Body
            </Typography>
            <Typography
              style={{ marginLeft: 11, fontSize: 11, fontWeight: 200 }}
              variant="subtitle2"
            >
              application/json
            </Typography>
          </div>
        </div>
      </div>
    </Paper>
  );
}

function _NewRegions(props) {
  const {
    newRegions,
    ignoreDiff,
    acceptSuggestion,
    endpointPurpose,
    method,
    fullPath,
  } = props;
  const classes = useStyles();

  const [deselected, setDeselected] = useState([]);
  const [showExpanded, setShowExpanded] = useState(false);

  if (lengthScala(newRegions) === 0) {
    return null;
  }

  const isDeselected = (diff) =>
    !!deselected.find((i) => CompareEquality.between(i, diff.diff));
  const onChange = (diff) => (e) => {
    if (!e.target.checked) {
      setDeselected([...deselected, diff.diff]);
    } else {
      setDeselected(
        deselected.filter((i) => !CompareEquality.between(i, diff.diff))
      );
    }
  };

  const onApply = () => {
    const allIgnored = filterScala(newRegions)((diffBlock) =>
      isDeselected(diffBlock)
    ).map((i) => i.diff);
    ignoreDiff(...allIgnored);
    const allApproved = filterScala(newRegions)(
      (diffBlock) => !isDeselected(diffBlock)
    ).map((i) => i.firstSuggestion);
    acceptSuggestion(...allApproved);
  };

  const newRequests = mapScala(newRegions)((diff) => {
    if (diff.inRequest) {
      return (
        <ListItem>
          <ListItemAvatar>
            <Checkbox
              checked={!isDeselected(diff)}
              onChange={onChange(diff)}
              color="primary"
            />
          </ListItemAvatar>
          <ListItemText
            primary={getOrUndefined(diff.contentType) || 'No Body'}
            secondary={`Observed ${diff.count} times`}
            primaryTypographyProps={{ style: { fontSize: 14 } }}
            secondaryTypographyProps={{ style: { fontSize: 12 } }}
          />
        </ListItem>
      );
    }
  }).filter((i) => !!i);

  const newResponses = mapScala(newRegions)((diff) => {
    if (diff.inResponse) {
      return (
        <ListItem>
          <ListItemAvatar>
            <Checkbox
              checked={!isDeselected(diff)}
              onChange={onChange(diff)}
              color="primary"
            />
          </ListItemAvatar>
          <ListItemText
            primary={`${getOrUndefined(diff.statusCode)} Response ${
              getOrUndefined(diff.contentType) || 'No Body'
            }`}
            secondary={`Observed ${diff.count} times`}
            primaryTypographyProps={{ style: { fontSize: 14 } }}
            secondaryTypographyProps={{ style: { fontSize: 12 } }}
          />
        </ListItem>
      );
    }
  }).filter((i) => !!i);

  const copy =
    newResponses.length > 0 &&
    newRequests.length > 0 &&
    'request and response types';
  const copyFallback =
    newResponses.length > 0 && newRequests.length === 0
      ? 'response types'
      : 'request types';

  const approveCount =
    newResponses.length + newRequests.length - deselected.length;

  return (
    <Card className={classes.wrapper} elevation={2}>
      <div className={classes.header}>
        <Typography variant="h6" color="primary">
          Generate Initial Documentation
        </Typography>
        <Typography variant="caption" color="textSecondary">{`New ${
          copy || copyFallback
        } types observed. Click Approve to document them.`}</Typography>
        {/*<div>*/}
        {/*  <Typography variant="h6">{endpointPurpose}</Typography>*/}
        {/*  <PathAndMethod method={method}*/}
        {/*                 path={fullPath}/>*/}
        {/*</div>*/}
      </div>

      <div style={{ float: 'right', marginTop: -55 }}>
        <PulsingOptic />
      </div>
      <div className={classes.diffsNewRegion}>
        {newRequests.length > 0 && (
          <List
            style={{ flex: 1 }}
            subheader={
              <ListSubheader className={classes.subheader}>
                Requests
              </ListSubheader>
            }
          >
            {newRequests}
          </List>
        )}
        {newResponses.length > 0 && (
          <List
            style={{ flex: 1 }}
            subheader={
              <ListSubheader className={classes.subheader}>
                Responses
              </ListSubheader>
            }
          >
            {newResponses}
          </List>
        )}
      </div>
      <CardActions style={{ float: 'right', padding: 15 }}>
        <Button
          color="primary"
          variant="contained"
          disabled={approveCount === 0}
          onClick={onApply}
          autoFocus
        >
          Approve ({approveCount})
        </Button>
      </CardActions>
    </Card>
  );
}

export const NewRegions = withDiffContext(_NewRegions);

export const BreadcumbX = (props) => {
  const classes = useStyles();
  const { location, itemStyles } = props;
  return (
    <Breadcrumbs
      className={classes.location}
      separator={<span style={{ fontSize: 13, ...itemStyles }}>{'›'}</span>}
      aria-label="breadcrumb"
    >
      {location
        .filter((i) => !!i)
        .map((n) => (
          <Typography
            key={n}
            style={itemStyles}
            className={classes.crumb}
            color="primary"
          >
            {n}
          </Typography>
        ))}
    </Breadcrumbs>
  );
};

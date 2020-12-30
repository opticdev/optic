import React, { useContext, useEffect, useMemo, useState } from 'react';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import { IconButton } from '@material-ui/core';
import Collapse from '@material-ui/core/Collapse';
import { DocDarkGrey } from '../../docs/DocConstants';
import LinearProgress from '@material-ui/core/LinearProgress';
import { DiffSummaryRegion, ReviewDiff } from './ReviewDiff';
import Divider from '@material-ui/core/Divider';
import equals from 'lodash.isequal';

export const EndpointDiffSessionContext = React.createContext(null);

export function useEndpointDiffSession() {
  return useContext(EndpointDiffSessionContext);
}

export function ReviewEndpoint(props) {
  const { pathId, method, useEndpointDiffMachine } = props;
  const {
    value,
    context,
    actions,
    queries,
    makeDiffActorHook,
  } = useEndpointDiffMachine();

  useMemo(() => actions.prepare(), []);

  const contextValue = {
    pathId,
    value,
    method,
    endpointActions: actions,
    endpointQueries: queries,
    makeDiffActorHook,
  };

  const handled = queries.handledByDiffHash();
  const groupDiffsByLocation = useMemo(
    () => queries.groupDiffsByLocation(),
    []
  );

  return (
    <EndpointDiffSessionContext.Provider value={contextValue}>
      <ReviewEndpointInnerWrapper
        {...{
          pathId,
          method,
          makeDiffActorHook,
          handled,
          groupDiffsByLocation,
        }}
      />
    </EndpointDiffSessionContext.Provider>
  );
}

class ReviewEndpointInnerWrapper extends React.Component {
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return (
      !equals(nextProps.handled, this.props.handled) ||
      !equals(nextProps.groupDiffsByLocation, this.props.groupDiffsByLocation)
    );
  }

  render() {
    return <ReviewEndpointInner {...this.props} />;
  }
}

export function ReviewEndpointInner(props) {
  const {
    pathId,
    method,
    makeDiffActorHook,
    groupDiffsByLocation,
    handled,
  } = props;

  console.log('re-render endpoints ');

  return (
    <Box display="flex" flexDirection="column" key={pathId + method}>
      {groupDiffsByLocation.requests.map((i, index) => (
        <EndpointGrouping
          handled={handled}
          makeDiffActorHook={makeDiffActorHook}
          key={'diff-requests' + index}
          {...i}
        />
      ))}

      {groupDiffsByLocation.newRequests.map((i, index) => (
        <EndpointGrouping
          handled={handled}
          makeDiffActorHook={makeDiffActorHook}
          key={'diff-new-requests' + index}
          {...i}
        />
      ))}

      {groupDiffsByLocation.responses.map((i, index) => (
        <EndpointGrouping
          handled={handled}
          makeDiffActorHook={makeDiffActorHook}
          key={'diff-responses' + index}
          {...i}
        />
      ))}

      {groupDiffsByLocation.newResponses.map((i, index) => (
        <EndpointGrouping
          handled={handled}
          makeDiffActorHook={makeDiffActorHook}
          key={'diff-new-responses' + index}
          {...i}
        />
      ))}
    </Box>
  );
}

export function EndpointGrouping(props) {
  const classes = useStyles();
  const noDiffs = props.diffs.length === 0;

  const [expanded, setExpanded] = useState(!noDiffs);

  const handledByDiffHash = props.handled;
  const { makeDiffActorHook } = props;

  const handledCount = props.diffs.filter(
    (i) => !!handledByDiffHash[i.diffParsed.diffHash]
  ).length;
  const percent = Math.round((handledCount / props.diffs.length) * 100);

  if (noDiffs) {
    return null;
  }

  return (
    <>
      <Divider />
      <Paper
        className={classes.sectionHeader}
        onClick={() => !noDiffs && setExpanded(!expanded)}
        square
        elevation={0}
      >
        <IconButton
          disabled={noDiffs}
          size="small"
          onClick={() => !noDiffs && setExpanded(!expanded)}
          style={{ height: 22, width: 22 }}
        >
          {expanded ? (
            <ArrowDropDownIcon style={{ height: 22, width: 22 }} />
          ) : (
            <ArrowRightIcon style={{ height: 22, width: 22 }} />
          )}
        </IconButton>
        <div style={{ opacity: noDiffs ? 0.5 : 1 }}>
          <LocationBreadcumbX location={props.location} />
        </div>
        <div style={{ flex: 1 }} />
        <div
          style={{
            fontSize: 10,
            color: DocDarkGrey,
            marginRight: 10,
            paddingTop: 2,
          }}
        >
          {noDiffs
            ? 'No Diffs'
            : `You have handled ${handledCount}/${props.diffs.length} Diffs`}
        </div>
        {!noDiffs && (
          <LinearProgress
            value={percent}
            variant="determinate"
            style={{ flex: 1, maxWidth: 80, marginRight: 10, paddingTop: 2 }}
          />
        )}
      </Paper>
      <Collapse in={expanded && !noDiffs}>
        <div className={classes.diffContainer}>
          {props.diffs.map((i) => (
            <ReviewDiff
              key={i.diffParsed.diffHash}
              diff={i.diffParsed}
              makeActor={() => {
                return makeDiffActorHook(i.diffParsed.diffHash);
              }}
            />
          ))}
        </div>
      </Collapse>
    </>
  );
}

export const LocationBreadcumbX = (props) => {
  const classes = useStyles();
  const { location, itemStyles } = props;
  return (
    <Breadcrumbs
      className={classes.location}
      separator={
        <span style={{ fontSize: 10, color: 'black', ...itemStyles }}>
          {'›'}
        </span>
      }
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

const useStyles = makeStyles((theme) => ({
  location: {
    marginLeft: 12,
  },
  crumb: {
    fontSize: 10,
    textTransform: 'uppercase',
  },
  sectionHeader: {
    backgroundColor: 'white',
    display: 'flex',
    position: 'sticky',
    top: 0,
    zIndex: 800,
    flexDirection: 'row',
    cursor: 'pointer',
    alignItems: 'center',
    padding: 3,
    paddingLeft: 5,
    borderBottom: `1px solid #e2e2e2`,
    transition: '.2s background-color',
    '&:hover': {
      backgroundColor: '#efeff1',
      transition: '.2s background-color',
    },
  },
  diffContainer: {
    paddingLeft: 0,
    paddingRight: 0,
  },
}));

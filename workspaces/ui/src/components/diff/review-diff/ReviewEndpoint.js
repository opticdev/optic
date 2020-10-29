import React, { useContext, useEffect, useMemo, useState } from 'react';
import { DiffSessionContext, useDiffSession } from './ReviewDiffSession';
import { useActor, useMachine } from '@xstate/react';
import { stuffFromQueries } from '../../../contexts/RfcContext';
import { createEndpointDescriptor } from '../../../utilities/EndpointUtilities';
import sortby from 'lodash.sortby';
import { SubtleEndpointTOC } from './SubtleEndpointTOC';
import Box from '@material-ui/core/Box';
import { BreadcumbX } from '../v2/DiffNewRegions';
import Paper from '@material-ui/core/Paper';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import { IconButton } from '@material-ui/core';
import Collapse from '@material-ui/core/Collapse';
import { Handled } from './ReviewUI';
import { DocDarkGrey } from '../../docs/DocConstants';
import LinearProgress from '@material-ui/core/LinearProgress';
import { ReviewDiff } from './ReviewDiff';
import { SubtleBlueBackground } from '../../../theme';
import Divider from '@material-ui/core/Divider';

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

  return (
    <EndpointDiffSessionContext.Provider value={contextValue}>
      <ReviewEndpointInner />
    </EndpointDiffSessionContext.Provider>
  );
}

export function ReviewEndpointInner(props) {
  const { endpointQueries, pathId, method } = useEndpointDiffSession();

  const handled = endpointQueries.handledByDiffHash();

  const grouped = useMemo(() => endpointQueries.groupDiffsByLocation(), []);
  return (
    <Box display="flex" flexDirection="column" key={pathId + method}>
      {/*<SubtleEndpointTOC groupings={grouped} />*/}

      {grouped.requests.map((i, index) => (
        <EndpointGrouping
          handled={handled}
          key={'diff-requests' + index}
          {...i}
        />
      ))}
      {grouped.responses.map((i, index) => (
        <EndpointGrouping
          handled={handled}
          key={'diff-responses' + index}
          {...i}
        />
      ))}

      {grouped.newRequests.map((i, index) => (
        <EndpointGrouping
          handled={handled}
          key={'diff-new-requests' + index}
          {...i}
        />
      ))}
      {grouped.newResponses.map((i, index) => (
        <EndpointGrouping
          handled={handled}
          key={'diff-new-responses' + index}
          {...i}
        />
      ))}
    </Box>
  );
}

export function EndpointGrouping(props) {
  const classes = useStyles();
  const [expanded, setExpanded] = useState(true);

  const handledByDiffHash = props.handled;

  const handledCount = props.diffs.filter(
    (i) => !!handledByDiffHash[i.diffParsed.diffHash]
  ).length;
  const percent = Math.round((handledCount / props.diffs.length) * 100);

  return (
    <>
      <Divider />
      <Paper
        className={classes.sectionHeader}
        onClick={() => setExpanded(!expanded)}
        square
      >
        <IconButton size="small" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ArrowDropDownIcon /> : <ArrowRightIcon />}
        </IconButton>
        <LocationBreadcumbX location={props.location} />
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 10, color: DocDarkGrey, marginRight: 10 }}>
          You have handled 0/{props.diffs.length} Diffs
        </div>
        <LinearProgress
          value={percent}
          variant="determinate"
          style={{ flex: 1, maxWidth: 80, marginRight: 10 }}
        />
      </Paper>
      <Collapse in={expanded}>
        <div className={classes.diffContainer}>
          {props.diffs.map((i) => (
            <ReviewDiff key={i.diffParsed.diffHash} diff={i.diffParsed} />
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
        <span style={{ fontSize: 12, color: 'black', ...itemStyles }}>
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
    fontSize: 12,
    textTransform: 'uppercase',
  },
  sectionHeader: {
    backgroundColor: SubtleBlueBackground,
    display: 'flex',
    position: 'sticky',
    top: 0,
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
    paddingTop: 10,
    paddingLeft: 10,
    paddingRight: 10,
  },
}));

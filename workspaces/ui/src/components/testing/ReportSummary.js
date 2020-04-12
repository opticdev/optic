import React, {useMemo} from 'react';
import {opticEngine} from '@useoptic/domain';
import {makeStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
// TODO: find a more appropriate place for this logic to live rather than in
import {StableHasher} from '../../utilities/CoverageUtilities';
import {EndpointsContext, EndpointsContextStore} from '../../contexts/EndpointContext';
import {PathAndMethod} from '../diff/v2/PathAndMethod';

export default function ReportSummary(props) {
  const {capture, report, spec} = props;
  const classes = useStyles();

  const {SimulatedContext} = spec;


  const summary = useMemo(() => createSummary(capture, spec, report), [
    capture,
    spec,
    report
  ]);
  const {
    endpoints,
    totalInteractions,
    totalCompliantInteractions,
    totalDiffs,
    totalUnmatchedPaths
  } = summary;

  return (
    <SimulatedContext>
      <div className={classes.root}>
        <div className={classes.stats}>
          <SummaryStats
            totalInteractions={totalInteractions}
            totalDiffs={totalDiffs}
            totalUnmatchedPaths={totalUnmatchedPaths}
          />
        </div>

        <small>
          Captured from {summary.createdAt} until {summary.updatedAt}
        </small>

        <h4>Endpoints</h4>

        {endpoints.length > 0 ? (
          <ul>
            {endpoints.map((endpoint) => (
              <EndpointsContextStore method={endpoint.method} pathId={endpoint.pathId}>
                <EndpointsContext.Consumer>
                  {({endpointDescriptor, endpointId}) => {
                    const {counts} = endpoint
                    return (
                      <li key={endpointId}>
                        <PathAndMethod method={endpointDescriptor.method} path={endpointDescriptor.fullPath}/>{' '}
                        {endpointDescriptor.endpointPurpose}: ({counts.compliant} {'/'}
                        {counts.interactions} interactions compliant)
                      </li>
                    );
                  }}
                </EndpointsContext.Consumer>
              </EndpointsContextStore>
            ))}
          </ul>
        ) : (
          // @TODO: revisit this empty state
          <p>No endpoints have been documented yet</p>
        )}
      </div>
    </SimulatedContext>
  );
}
ReportSummary.displayName = 'Testing/ReportSummary';

function SummaryStats({totalInteractions, totalDiffs, totalUnmatchedPaths}) {
  const classes = useStyles();

  return (
    <Typography variant="h6" color="primary" style={{fontWeight: 200}}>
      Optic observed <Stat value={totalInteractions} label="interaction"/>
      , yielding in <Stat value={totalDiffs} label="diff"/> and{' '}
      <Stat value={totalUnmatchedPaths} label="undocumented endpoint"/>.
    </Typography>
  );
}

SummaryStats.displayName = 'Testing/ReportSummary/SummaryStats';

function Stat({value = 0, label = ''}) {
  return (
    <span>
      {value !== 0 && (
        <Typography
          variant="h6"
          component="span"
          color="secondary"
          style={{fontWeight: 800}}
        >
          {value}{' '}
        </Typography>
      )}
      <Typography variant="h6" component="span" style={{fontWeight: 800}}>
        {value === 0 && 'no '}
        {label}
        {value === 1 ? '' : 's'}
      </Typography>
    </span>
  );
}

// Styles
// -------
const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3, 4)
  },

  summaryStat: {}
}));

const CoverageConcerns = opticEngine.com.useoptic.coverage;

// View models
// -----------
// TODO: consider moving these into their own modules or another appropriate spot (probably stable
// for the entire dashboard context if not all of the app?)

function createSummary(capture, spec, report) {
  const {apiName, endpoints} = spec;

  const endpointsWithCounts = endpoints.map(({method, pathId}) => {
    const interactionsCounts = getCoverageCount(
      CoverageConcerns.TotalForPathAndMethod(pathId, method)
    );
    const diffsCount = 1; // TODO: Hardcoded test value, replace by deriving from report,
    const compliantCount = interactionsCounts - diffsCount;

    return {
      method,
      pathId,
      counts: {
        interactions: interactionsCounts,
        diffs: diffsCount,
        compliant: compliantCount
      }
    };
  });

  const totalInteractions = getCoverageCount(
    CoverageConcerns.TotalInteractions()
  );
  const totalUnmatchedPaths = getCoverageCount(
    CoverageConcerns.TotalUnmatchedPath()
  );

  const totalDiffs = 1; // TODO: Hardcoded test value, replace by deriving from report
  const totalCompliantInteractions = totalInteractions - totalDiffs;

  return {
    apiName,
    createdAt: capture.createdAt,
    updatedAt: capture.updatedAt,
    endpoints: endpointsWithCounts,
    totalInteractions,
    totalUnmatchedPaths,
    totalDiffs,
    totalCompliantInteractions
  };

  function getCoverageCount(concern) {
    const key = StableHasher.hash(concern);
    return report.coverageCounts[key] || 0;
  }
}

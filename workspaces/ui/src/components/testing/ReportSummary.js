import React, { useMemo } from 'react';
import { opticEngine } from '@useoptic/domain';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

// TODO: find a more appropriate place for this logic to live rather than in
// Contexts now that it's being re-used elsewhere.
import {
  flattenPaths,
  flatMapOperations
} from '../../contexts/ApiOverviewContext';
import * as uniqBy from 'lodash.uniqby';
import { StableHasher } from '../../utilities/CoverageUtilities';

import ScheduleIcon from '@material-ui/icons/Schedule';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';

export default function ReportSummary(props) {
  const { capture, report, spec } = props;
  const classes = useStyles();

  const summary = useMemo(() => createSummary(capture, spec, report), [
    capture,
    spec,
    report
  ]);
  const {
    endpoints,
    isCapturing,
    totalInteractions,
    totalCompliantInteractions,
    totalDiffs,
    totalUnmatchedPaths
  } = summary;

  return (
    <div className={classes.root}>
      <div className={classes.reportMeta}>
        <div className={classes.captureTime}>
          {summary.isCapturing ? (
            <div className={classes.liveIndicator}>
              <FiberManualRecordIcon className={classes.recordIcon} />
              <span className={classes.liveLabel}>LIVE</span>
            </div>
          ) : (
            <ScheduleIcon className={classes.historyIcon} />
          )}
          {summary.isCapturing ? 'since' : ''} last Monday for 4 hours
        </div>
      </div>

      <div className={classes.stats}>
        <SummaryStats
          totalInteractions={totalInteractions}
          totalDiffs={totalDiffs}
          totalUnmatchedPaths={totalUnmatchedPaths}
        />
        <h4 className={classes.buildName}>
          from capturing interactions for build <code>{summary.buildId}</code>{' '}
          in <code>{summary.environment}</code>
        </h4>
      </div>

      <h4>Endpoints</h4>

      {endpoints.length > 0 ? (
        <ul>
          {endpoints.map((endpoint) => (
            <li key={endpoint.request.requestId}>
              <strong>{endpoint.request.httpMethod}</strong>{' '}
              {endpoint.path.name}: ({endpoint.counts.compliant}/
              {endpoint.counts.interactions} interactions compliant)
            </li>
          ))}
        </ul>
      ) : (
        // @TODO: revisit this empty state
        <p>No endpoints have been documented yet</p>
      )}
    </div>
  );
}
ReportSummary.displayName = 'Testing/ReportSummary';

function SummaryStats({ totalInteractions, totalDiffs, totalUnmatchedPaths }) {
  const classes = useStyles();

  return (
    <Typography variant="h6" color="primary" style={{ fontWeight: 200 }}>
      Optic observed <Stat value={totalInteractions} label="interaction" />
      , yielding in <Stat value={totalDiffs} label="diff" /> and{' '}
      <Stat value={totalUnmatchedPaths} label="undocumented endpoint" />.
    </Typography>
  );
}
SummaryStats.displayName = 'Testing/ReportSummary/SummaryStats';

function Stat({ value = 0, label = '' }) {
  return (
    <span>
      {value !== 0 && (
        <Typography
          variant="h6"
          component="span"
          color="secondary"
          style={{ fontWeight: 800 }}
        >
          {value}{' '}
        </Typography>
      )}
      <Typography variant="h6" component="span" style={{ fontWeight: 800 }}>
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
    padding: theme.spacing(3, 4),
    maxWidth: theme.breakpoints.values.lg,
    flexGrow: 1
  },

  reportMeta: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: theme.spacing(3)
  },

  captureTime: {
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.grey[500],
    fontSize: theme.typography.pxToRem(12)
  },

  buildName: {
    ...theme.typography.subtitle2,
    fontWeight: theme.typography.fontWeightLight,
    margin: 0,
    marginTop: theme.spacing(0.25),
    color: theme.palette.primary.light,

    '& code': {
      color: theme.palette.primary.light,
      fontWeight: 'bold'
    }
  },

  stats: {
    marginBottom: theme.spacing(6)
  },

  liveIndicator: {
    display: 'flex',
    alignItems: 'center',
    marginRight: theme.spacing(0.5)
  },

  recordIcon: {
    width: 16,
    height: 16,
    marginRight: theme.spacing(0.5),
    fill: theme.palette.secondary.main
  },

  liveLabel: {
    ...theme.typography.caption
  },

  historyIcon: {
    width: 14,
    height: 14,
    marginRight: theme.spacing(0.5)
  },

  summaryStat: {}
}));

const CoverageConcerns = opticEngine.com.useoptic.coverage;

// View models
// -----------
// TODO: consider moving these into their own modules or another appropriate spot (probably stable
// for the entire dashboard context if not all of the app?)

function createSummary(capture, spec, report) {
  const { apiName, pathsById, requestIdsByPathId, requests } = spec;

  const pathIds = Object.keys(pathsById);
  const flattenedPaths = flattenPaths('root', pathsById, 0, '', []);
  const allPaths = [flattenedPaths, ...flattenedPaths.children];

  const endpoints = uniqBy(
    flatMapOperations(allPaths, {
      requests,
      requestIdsByPathId
    }),
    'requestId'
  ).map(({ request, path }) => {
    const { pathId } = path;
    const { requestDescriptor, isRemoved, requestId } = request;
    const { httpMethod } = requestDescriptor;

    const interactionsCounts = getCoverageCount(
      CoverageConcerns.TotalForPathAndMethod(pathId, httpMethod)
    );
    const diffsCount = 1; // TODO: Hardcoded test value, replace by deriving from report,
    const compliantCount = interactionsCounts - diffsCount;

    return {
      request: {
        requestId,
        httpMethod,
        isRemoved
      },
      path: {
        name: path.name
      },
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

  const buildIdTag = capture.tags.find(({ name }) => name === 'buildId');
  const envTag = capture.tags.find(({ name }) => name === 'environment');

  return {
    apiName,
    createdAt: capture.createdAt,
    updatedAt: capture.updatedAt,
    completedAt: capture.completedAt,
    isCapturing: !capture.completedAt,
    buildId: (buildIdTag && buildIdTag.value) || '',
    environment: (envTag && envTag.value) || '',
    endpoints,
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

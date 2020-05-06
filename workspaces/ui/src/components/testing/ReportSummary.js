import React, { useMemo } from 'react';
import { opticEngine } from '@useoptic/domain';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import classNames from 'classnames';
import Color from 'color';
import dateFormatRelative from 'date-fns/formatRelative';
import dateFormatDistance from 'date-fns/formatDistance';
import { parseISO as dateParseISO } from 'date-fns';
import { usePageTitle } from '../Page';

import {
  createEndpointDescriptor,
  getEndpointId,
} from '../../utilities/EndpointUtilities';
import { StableHasher } from '../../utilities/CoverageUtilities';

import ScheduleIcon from '@material-ui/icons/Schedule';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import { Card } from '@material-ui/core';
import { ReportEndpointLink } from './report-link';
import EndpointReport from './EndpointReport';

export default function ReportSummary(props) {
  const { capture, report, spec, currentEndpointId } = props;
  const classes = useStyles();
  const classesHttpMethods = useHttpMethodStyles();
  const { captureId } = capture;

  const summary = useMemo(() => createSummary(capture, spec, report), [
    capture,
    spec,
    report,
  ]);
  const {
    endpoints,
    isCapturing,
    totalInteractions,
    totalCompliantInteractions,
    totalDiffs,
    totalUnmatchedPaths,
  } = summary;

  const now = new Date();

  usePageTitle(
    summary.buildId && summary.environment
      ? `Report for '${summary.buildId}' in '${summary.environment}'`
      : 'Report'
  );

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
          {summary.isCapturing ? (
            <>since {dateFormatRelative(summary.createdAt, now)}</>
          ) : (
            <>
              {dateFormatRelative(summary.createdAt, now)} for{' '}
              {dateFormatDistance(summary.completedAt, summary.createdAt)}
            </>
          )}
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

      <h4 className={classes.endpointsHeader}>Endpoints</h4>

      {endpoints.length > 0 ? (
        <ul className={classes.endpointsList}>
          {endpoints.map((endpoint) => (
            <li
              key={endpoint.id}
              className={classNames(classes.endpointsListItem, {
                [classes.isCurrent]:
                  currentEndpointId && endpoint.id === currentEndpointId,
              })}
            >
              <Card className={classes.endpointCard}>
                <ReportEndpointLink
                  className={classes.endpointLink}
                  captureId={captureId}
                  endpointId={endpoint.id}
                >
                  <div className={classes.endpointHeader}>
                    <span
                      className={classNames(
                        classes.endpointMethod,
                        classesHttpMethods[endpoint.descriptor.httpMethod]
                      )}
                    >
                      {endpoint.descriptor.httpMethod}
                    </span>
                    <code className={classes.endpointPath}>
                      {endpoint.descriptor.fullPath}
                    </code>

                    <div className={classes.endpointStats}>
                      {endpoint.counts.diffs > 0 && (
                        <span
                          className={classNames(
                            classes.endpointChip,
                            classes.endpointDiffsChip
                          )}
                        >
                          <strong>{endpoint.counts.diffs}</strong>
                          {endpoint.counts.diffs > 1 ? ' diffs' : ' diff'}
                        </span>
                      )}
                      {endpoint.counts.incompliant > 0 ? (
                        <span
                          className={classNames(
                            classes.endpointChip,
                            classes.endpointIncompliantChip
                          )}
                        >
                          <strong>
                            {endpoint.counts.incompliant}/
                            {endpoint.counts.interactions}
                          </strong>
                          {' incompliant'}
                        </span>
                      ) : (
                        <span
                          className={classNames(
                            classes.endpointChip,
                            classes.endpointCompliantChip
                          )}
                        >
                          <strong>
                            {endpoint.counts.compliant}/
                            {endpoint.counts.interactions}
                          </strong>
                          {' compliant'}
                        </span>
                      )}
                    </div>
                  </div>
                </ReportEndpointLink>

                {currentEndpointId && endpoint.id === currentEndpointId && (
                  <EndpointReport endpoint={endpoint} captureId={captureId} />
                )}
              </Card>
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
    flexGrow: 1,
  },

  reportMeta: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: theme.spacing(3),
  },

  captureTime: {
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.grey[500],
    fontSize: theme.typography.pxToRem(12),
  },

  buildName: {
    ...theme.typography.subtitle2,
    fontWeight: theme.typography.fontWeightLight,
    margin: 0,
    marginTop: theme.spacing(0.25),
    color: theme.palette.primary.light,

    '& code': {
      color: theme.palette.primary.light,
      fontWeight: 'bold',
    },
  },

  stats: {
    marginBottom: theme.spacing(6),
  },

  liveIndicator: {
    display: 'flex',
    alignItems: 'center',
    marginRight: theme.spacing(0.5),
  },

  recordIcon: {
    width: 16,
    height: 16,
    marginRight: theme.spacing(0.5),
    fill: theme.palette.secondary.main,
  },

  liveLabel: {
    ...theme.typography.caption,
  },

  historyIcon: {
    width: 14,
    height: 14,
    marginRight: theme.spacing(0.5),
  },

  summaryStat: {},

  endpointsHeader: {
    ...theme.typography.overline,
    color: '#818892',
    borderBottom: `1px solid #e3e8ee`,
  },

  endpointsList: {
    margin: theme.spacing(0, -2),
    padding: 0,
    listStyleType: 'none',
  },

  endpointCard: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'rgba(255,255,255,0)',
    boxShadow: 'none',

    willChange: 'backgroundColor',
    transition: '0.1s ease-out backgroundColor',

    '$isCurrent &': {
      margin: theme.spacing(1, 0),
      boxShadow: theme.shadows[2],
      backgroundColor: 'rgba(255,255,255,1)',
    },
  },

  endpointLink: {
    flexGrow: 1,
    padding: theme.spacing(1, 0),
    textDecoration: 'none',
    color: 'inherit',

    '&:hover': {
      backgroundColor: theme.palette.grey[100],
    },

    '$isCurrent &': {
      backgroundColor: 'transparent',
      padding: 0,

      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
  },

  endpointHeader: {
    display: 'grid',
    gridTemplateColumns: 'max-content 1fr max-content',
    gridColumnGap: theme.spacing(2),
    alignItems: 'center',
    padding: theme.spacing(0, 2),
    // paddingTop: 0,
    // paddingBottom: 0,

    willChange: 'padding',
    transition: '0.1s ease-out padding',

    '$isCurrent &': {
      padding: theme.spacing(2, 2),
      // paddingTop: theme.spacing(2),
      // paddingBottom: theme.spacing(2),
    },
  },

  endpointMethod: {
    padding: theme.spacing(0.5),
    flexGrow: 0,
    flexShrink: 0,
    borderRadius: theme.shape.borderRadius,

    fontWeight: theme.typography.fontWeightRegular,
  },

  endpointPath: {
    fontSize: theme.typography.pxToRem(13),
    color: theme.palette.primary.main,
  },

  endpointStats: {
    display: 'flex',
  },

  endpointChip: {
    flexGrow: 0,
    flexShrink: 0,

    height: theme.spacing(3),
    padding: theme.spacing(0, 1),
    marginRight: theme.spacing(1),

    borderRadius: theme.spacing(3 / 2),
    fontSize: theme.typography.pxToRem(11),
    lineHeight: `${theme.spacing(3)}px`,

    '& > strong': {
      fontSize: theme.typography.pxToRem(13),
    },
  },

  endpointDiffsChip: {
    background: Color(theme.palette.error.light).lighten(0.3).hex(),

    color: Color(theme.palette.error.dark).darken(0.5).hex(),
  },

  endpointIncompliantChip: {
    background: Color(theme.palette.warning.light).lighten(0.3).hex(),
    color: Color(theme.palette.warning.dark).darken(0.5).hex(),
  },

  endpointCompliantChip: {
    background: Color(theme.palette.success.light).lighten(0.3).hex(),
    color: Color(theme.palette.success.dark).darken(0.5).hex(),
  },

  // states
  isCurrent: {},
}));

// TODO: Consider moving this to PathAndMethod or some other more general module, for consistency.
// Take note that probably means allowing injecting base styles, as context dictates a lot of that.
const useHttpMethodStyles = makeStyles((theme) => {
  const base = {
    color: '#fff',
  };

  return ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].reduce(
    (styles, httpMethod) => {
      const color = theme.palette.httpMethods[httpMethod];
      styles[httpMethod] = {
        ...base,
        backgroundColor: color.dark,
      };
      return styles;
    },
    {}
  );
});

const CoverageConcerns = opticEngine.com.useoptic.coverage;

// View models
// -----------
// TODO: consider moving these into their own modules or another appropriate spot (probably stable
// for the entire dashboard context if not all of the app?)

function createSummary(capture, spec, report) {
  const { apiName, endpoints: specEndpoints } = spec;

  const endpoints = specEndpoints.map((endpoint, i) => {
    const endpointDescriptor = createEndpointDescriptor(endpoint, spec);
    const endpointId = getEndpointId(endpoint);

    const { pathId, httpMethod } = endpointDescriptor;

    const interactionsCounts = getCoverageCount(
      CoverageConcerns.TotalForPathAndMethod(pathId, httpMethod)
    );
    const incompliantInteractions = i % 2; // TODO: Hardcoded test value, replace by deriving from report,
    const diffsCount = incompliantInteractions * (i % 3 === 0 ? 1 : 2); // TODO: Hardcoded test value, replace by deriving from report,
    const compliantCount = interactionsCounts - incompliantInteractions;

    return {
      id: endpointId,
      pathId: endpoint.pathId,
      method: endpoint.method,
      descriptor: endpointDescriptor,
      counts: {
        interactions: interactionsCounts,
        diffs: diffsCount,
        compliant: compliantCount,
        incompliant: incompliantInteractions,
      },
    };
  });

  const totalInteractions = getCoverageCount(
    CoverageConcerns.TotalInteractions()
  );
  const totalUnmatchedPaths = getCoverageCount(
    CoverageConcerns.TotalUnmatchedPath()
  );

  const totalDiffs = endpoints // TODO: Hardcoded test value, replace by deriving from report
    .map((endpoint) => endpoint.counts.diffs)
    .reduce((sum, num) => sum + num, 0);
  const totalCompliantInteractions = totalInteractions - totalDiffs;

  const buildIdTag = capture.tags.find(({ name }) => name === 'buildId');
  const envTag = capture.tags.find(({ name }) => name === 'environment');

  return {
    apiName,
    createdAt: asDate(capture.createdAt),
    updatedAt: asDate(capture.updatedAt),
    completedAt: asDate(capture.completedAt),
    isCapturing: !capture.completedAt,
    buildId: (buildIdTag && buildIdTag.value) || '',
    environment: (envTag && envTag.value) || '',
    endpoints,
    totalInteractions,
    totalUnmatchedPaths,
    totalDiffs,
    totalCompliantInteractions,
  };

  function getCoverageCount(concern) {
    const key = StableHasher.hash(concern);
    return report.coverageCounts[key] || 0;
  }

  function asDate(isoDate) {
    return isoDate && dateParseISO(isoDate);
  }
}

import React, { useEffect, useMemo, useRef } from 'react';
import { useTestingService } from '../../contexts/TestingDashboardContext';
import classNames from 'classnames';
import ReportLink from './report-link';
import dateParseISO from 'date-fns/parseISO';
import dateFormatRelative from 'date-fns/formatRelative';
import dateFormatDistance from 'date-fns/formatDistance';
import groupBy from 'lodash.groupby';
import scrollIntoView from 'scroll-into-view-if-needed';
import _sortBy from 'lodash.sortby';

// Components
import Loading from '../navigation/Loading';
import { Card } from '@material-ui/core';
import ScheduleIcon from '@material-ui/icons/Schedule';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import { makeStyles } from '@material-ui/core/styles';

export default function ReportsNavigation({ currentCaptureId }) {
  const classes = useStyles();
  const { loading, result: captures } = useTestingService(
    (service) => service.listCaptures(),
    []
  );

  const capturesLists = useMemo(() => createCapturesLists(captures || []), [
    captures,
  ]);

  if (loading) {
    return <Loading />;
  }

  return (
    <nav className={classes.navRoot}>
      {capturesLists.active.length > 0 && (
        <div className={classes.activeCaptures}>
          <ul className={classes.capturesList}>
            {capturesLists.active.map((activeCapture) => (
              <li
                key={activeCapture.captureId}
                className={classes.captureListItem}
              >
                <ActiveCapture
                  capture={activeCapture}
                  isCurrent={
                    currentCaptureId &&
                    activeCapture.captureId === currentCaptureId
                  }
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {capturesLists.completed.length > 0 && (
        <div>
          <ul className={classes.capturesList}>
            {capturesLists.completed.map((completeCapture) => (
              <li
                key={completeCapture.captureId}
                className={classes.captureListItem}
              >
                <CompletedCapture
                  capture={completeCapture}
                  isCurrent={
                    currentCaptureId &&
                    completeCapture.captureId === currentCaptureId
                  }
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
function ActiveCapture(props) {
  const { capture } = props;
  const { tags } = capture;
  const classes = useStyles();
  const domRef = useScrollToCurrent(props.isCurrent);

  const buildIdTag = tags.find(({ name }) => name === 'buildId');
  const envTag = tags.find(({ name }) => name === 'environment') || 'unknown';
  const now = new Date();

  return (
    <CaptureNavLink capture={capture} isCurrent={props.isCurrent}>
      <Card className={classNames(classes.card, classes.isActive)} ref={domRef}>
        <h5 className={classes.buildName}>
          Build <code className={classes.buildId}>{buildIdTag.value}</code> in{' '}
          <code>{envTag.value}</code>
        </h5>

        <div className={classes.captureTime}>
          <div className={classes.liveIndicator}>
            <FiberManualRecordIcon className={classes.recordIcon} />
            <span className={classes.liveLabel}>LIVE</span>
          </div>
          since {dateFormatRelative(capture.createdAt, now)}
        </div>
      </Card>
    </CaptureNavLink>
  );
}

function CompletedCapture(props) {
  const { capture } = props;
  const { tags } = capture;
  const classes = useStyles();
  const domRef = useScrollToCurrent(props.isCurrent);

  const buildIdTag = tags.find(({ name }) => name === 'buildId');
  const envTag = tags.find(({ name }) => name === 'environment');
  const now = new Date();

  return (
    <CaptureNavLink capture={capture}>
      <Card className={classNames(classes.card, classes.isComplete)}>
        <div className={classes.buildName} ref={domRef}>
          Build <code>{buildIdTag.value}</code> in <code>{envTag.value}</code>
        </div>

        <div className={classes.captureTime}>
          <ScheduleIcon className={classes.historyIcon} />
          {dateFormatRelative(capture.createdAt, now)} for{' '}
          {dateFormatDistance(capture.completedAt, capture.createdAt)}
        </div>
      </Card>
    </CaptureNavLink>
  );
}

function CaptureNavLink(props) {
  const { capture } = props;
  const classes = useStyles();

  return (
    <ReportLink
      className={classes.navLink}
      captureId={capture.captureId}
      activeClassName={classes.isCurrent}
    >
      {props.children}
    </ReportLink>
  );
}

function useScrollToCurrent(isCurrent) {
  const linkRef = useRef();
  useEffect(() => {
    if (!isCurrent) return;

    if (!linkRef.current)
      throw Error(
        'CaptureLink Ref must be set in order to scroll it into view upon activation'
      );

    scrollIntoView(linkRef.current, {
      scrollMode: 'if-needed',
      block: 'center',
    });
  }, [isCurrent]);

  return linkRef;
}

// Styles
// ------

const useStyles = makeStyles((theme) => ({
  navRoot: {
    padding: theme.spacing(2),
    flexGrow: 1,
    position: 'fixed',
    width: 'inherit',
    height: '100vh',
    overflowY: 'scroll',

    borderRight: `1px solid ${theme.palette.grey[300]}`,
    background: theme.palette.grey[100],
  },

  activeCaptures: {
    marginBottom: theme.spacing(3),
  },

  capturesList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none',
  },

  captureListItem: {},

  navLink: {
    textDecoration: 'none',
  },

  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1.5),
    boxShadow: '0 2px 4px 0 rgba(138, 148, 159, 0.3)',

    willChange: 'transform,box-shadow,margin-bottom',
    transform: 'translateX(0)',
    transition:
      '0.1s ease-out transform, 0.1s ease-out box-shadow, 0.1s ease-out marginBottom',

    ['&$isComplete']: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
    },

    // wrapping Link hovered
    ['$navLink:hover &, $navLink:focus &']: {
      boxShadow: '0 2px 4px 0 rgba(138, 148, 159, 0.6)',
      opacity: 1,
    },

    // currently selected
    ['$navLink$isCurrent &']: {
      borderLeft: `3px solid ${theme.palette.updated.main}`,
      opacity: 1,
      transform: `translateX(${theme.spacing(1)}px)`,
      boxShadow: [
        '0 2px 4px 0 rgba(138, 148, 159, 0.6)',
        '0 4px 8px 2px rgba(138, 148, 159, 0.15)',
      ].join(','),
      background: '#fff',
    },
  },

  // states, just so we can use them as modifiers for other rules
  isComplete: {},
  isCurrent: {},
  isActive: {},

  buildName: {
    '& code': {
      color: theme.palette.primary.light,
    },

    '$isActive &': {
      ...theme.typography.subtitle1,
      fontWeight: theme.typography.fontWeightLight,
      margin: 0,
      marginBottom: theme.spacing(0.75),
      // color: theme.palette.primary.main,
      '& code': {
        fontWeight: 'bold',
        fontSize: theme.typography.subtitle2.fontSize,
      },
    },
  },

  captureTime: {
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.grey[500],
    fontSize: theme.typography.pxToRem(12),
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

  envTag: {
    display: 'flex',
    justifyContent: 'center',

    fontSize: theme.typography.pxToRem(12),
  },

  envTagName: {
    display: 'flex',
    alignItems: 'center',
    height: theme.spacing(2.5),
    background: theme.palette.grey[100],
    border: `1px solid ${theme.palette.grey[200]}`,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },

  envTagVal: {
    display: 'flex',
    alignItems: 'center',
    height: theme.spacing(2.5),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    background: theme.palette.primary.light,
    color: '#fff',
  },
}));

// View models
// -----------

function createCapturesLists(rawCaptures) {
  const captures = rawCaptures.map((rawCap) => {
    const createdAt = dateParseISO(rawCap.createdAt);
    const updatedAt = rawCap.updatedAt && dateParseISO(rawCap.updatedAt);
    const completedAt = rawCap.completedAt && dateParseISO(rawCap.completedAt);
    const isActive = !completedAt;

    return {
      ...rawCap,
      isActive,
      createdAt,
      updatedAt,
      completedAt,
    };
  });

  const groupedByActive = groupBy(captures, (capture) =>
    capture.isActive ? 'active' : 'completed'
  );
  const active = _sortBy(
    groupedByActive['active'] || [],
    (capture) => -capture.createdAt
  );
  const completed = _sortBy(
    groupedByActive['completed'] || [],
    (capture) => -capture.completedAt
  );

  return { active, completed };
}

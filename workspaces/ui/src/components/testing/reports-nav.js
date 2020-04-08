import React, { useMemo } from 'react';
import { useTestingService } from '../../contexts/TestingDashboardContext';
import classNames from 'classnames';
import ReportLink from './report-link';
import dateParseISO from 'date-fns/parseISO';
import groupBy from 'lodash.groupby';

// Components
import Loading from '../navigation/Loading';
import { Card } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

export default function ReportsNavigation() {
  const classes = useStyles();
  const { loading, result: captures } = useTestingService(
    (service) => service.listCaptures(),
    []
  );

  const capturesLists = useMemo(() => createCapturesLists(captures || []), [
    captures
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
                <ActiveCapture capture={activeCapture} />
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
                <CompletedCapture capture={completeCapture} />
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

  const buildIdTag = tags.find(({ name }) => name === 'buildId');
  const envTag = tags.find(({ name }) => name === 'environment');

  return (
    <CaptureNavLink capture={capture}>
      <Card className={classes.card}>
        <h5 className={classes.buildName}>{buildIdTag.value}</h5>

        {envTag && `in ${envTag.value}`}
      </Card>
    </CaptureNavLink>
  );
}

function CompletedCapture(props) {
  const { capture } = props;
  const { tags } = capture;
  const classes = useStyles();

  const buildIdTag = tags.find(({ name }) => name === 'buildId');
  const envTag = tags.find(({ name }) => name === 'environment');

  return (
    <CaptureNavLink capture={capture}>
      <Card className={classNames(classes.card, classes.isComplete)}>
        {buildIdTag && `Build "${buildIdTag.value}" `}
        {envTag && `in ${envTag.value}`}
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

// Styles
// ------

const useStyles = makeStyles((theme) => ({
  navRoot: {
    padding: theme.spacing(2),
    flexGrow: 1,
    background: theme.palette.grey[100]
  },

  activeCaptures: {
    marginBottom: theme.spacing(3)
  },

  capturesList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none'
  },

  captureListItem: {
    marginBottom: theme.spacing(1.5)
  },

  navLink: {
    textDecoration: 'none'
  },

  card: {
    padding: theme.spacing(2),
    boxShadow: '0 2px 4px 0 rgba(138, 148, 159, 0.3)',

    willChange: 'transform,box-shadow',
    transform: 'translateX(0)',
    transition: '0.1s ease-out transform, 0.1s ease-out box-shadow',

    ['&$isComplete']: {
      opacity: 0.7
    },

    // wrapping Link hovered
    ['$navLink:hover &, $navLink:focus &']: {
      boxShadow: '0 2px 4px 0 rgba(138, 148, 159, 0.6)',
      opacity: 1
    },

    // currently selected
    ['$navLink$isCurrent &']: {
      borderLeft: `3px solid ${theme.palette.updated.main}`,
      opacity: 1,
      transform: `translateX(${theme.spacing(1)}px)`,
      boxShadow: [
        '0 2px 4px 0 rgba(138, 148, 159, 0.6)',
        '0 4px 8px 2px rgba(138, 148, 159, 0.15)'
      ].join(',')
    }
  },

  // states, just so we can use them as modifiers for other rules
  isComplete: {},
  isCurrent: {},

  buildName: {
    ...theme.typography.subtitle1,
    margin: 0
  }
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
      completedAt
    };
  });

  const groupedByActive = groupBy(captures, (capture) =>
    capture.isActive ? 'active' : 'completed'
  );
  const active = groupedByActive['active'] || [];
  const completed = groupedByActive['completed'] || [];

  return { active, completed };
}

import React, { useMemo } from 'react';
import { useTestingService } from '../../contexts/TestingDashboardContext';
import Loading from '../navigation/Loading';
import ReportLink from './report-link';
import dateParseISO from 'date-fns/parseISO';
import groupBy from 'lodash.groupby';

export default function ReportsNavigation() {
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
    <div>
      {capturesLists.active.length > 0 && (
        <div>
          <h6>Active</h6>

          <ul>
            {capturesLists.active.map((activeCapture) => (
              <li key={activeCapture.captureId}>
                <CaptureNavItem capture={activeCapture} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {capturesLists.completed.length > 0 && (
        <div>
          <h6>Completed</h6>

          <ul>
            {capturesLists.completed.map((completeCapture) => (
              <li key={completeCapture.captureId}>
                <CaptureNavItem capture={completeCapture} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function CaptureNavItem(props) {
  const { capture } = props;
  const { captureId, tags } = capture;

  const buildIdTag = tags.find(({ name }) => name === 'buildId');
  const envTag = tags.find(({ name }) => name === 'environment');

  return (
    <ReportLink captureId={captureId} activeStyle={{ fontWeight: 'bold' }}>
      {buildIdTag && `Build "${buildIdTag.value}" `}
      {envTag && `in ${envTag.value}`}
    </ReportLink>
  );
}

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

  const groupedByActive = groupBy(captures, (capture) =>
    capture.isActive ? 'active' : 'completed'
  );
  const active = groupedByActive['active'] || [];
  const completed = groupedByActive['completed'] || [];

  return { active, completed };
}

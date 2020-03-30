import React from 'react';
import { useTestingService } from '../../contexts/TestingDashboardContext';
import Loading from '../navigation/Loading';
import ReportLink from './report-link';

export default function ReportsNavigation() {
  const { loading, result: captures } = useTestingService((service) =>
    service.listCaptures()
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <ul>
        {captures.map((capture) => (
          <li key={capture.captureId}>
            <CaptureNavItem capture={capture} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function CaptureNavItem(props) {
  const { capture } = props;
  const { captureId, tags } = capture;

  const buildIdTag = tags.find(({ name }) => name === 'buildId');
  const envTag = tags.find(({ name }) => name === 'environment');

  return (
    <ReportLink captureId={captureId}>
      {buildIdTag && `Build "${buildIdTag.value}" `}
      {envTag && `in ${envTag.value}`}
    </ReportLink>
  );
}

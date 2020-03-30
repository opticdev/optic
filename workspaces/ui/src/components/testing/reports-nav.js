import React from 'react';
import { useTestingService } from '../../contexts/TestingDashboardContext';
import Loading from '../navigation/Loading';

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
    <Link path={`${}`}>
      build {buildIdTag && buildIdTag.value + ' '}
      {envTag && `in ${envTag.value}`}
    </Link>
  );
}

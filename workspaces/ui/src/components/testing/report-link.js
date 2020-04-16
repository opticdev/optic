import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  useEndpointPath,
  useReportPath
} from '../../contexts/TestingDashboardContext';

export default function ReportLink(props) {
  const { captureId, ...otherProps } = props;
  const path = useReportPath(captureId);

  return <NavLink {...otherProps} to={path} />;
}

export function ReportEndpointLink(props) {
  const { captureId, endpointId, ...otherProps } = props;
  const path = useEndpointPath(captureId, endpointId);

  return <NavLink {...otherProps} to={path} />;
}

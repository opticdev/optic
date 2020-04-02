import React from 'react';
import { NavLink } from 'react-router-dom';
import { useReportPath } from '../../contexts/TestingDashboardContext';

export default function ReportLink(props) {
  const { captureId, ...otherProps } = props;
  const path = useReportPath(captureId);

  return <NavLink {...otherProps} to={path} />;
}

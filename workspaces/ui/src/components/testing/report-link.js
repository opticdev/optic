import React from 'react';
import { NavLink } from '../Router';

export default function ReportLink(props) {
  const { captureId, ...otherProps } = props;

  return <NavLink {...otherProps} to={`/testing/captures/${captureId}`} />;
}

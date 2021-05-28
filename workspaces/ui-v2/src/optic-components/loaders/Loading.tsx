import React, { FC } from 'react';
import { LinearProgress } from '@material-ui/core';
import { PageLayout } from '../layouts/PageLayout';

export function Loading() {
  return <LinearProgress variant="indeterminate" />;
}

export const LoadingPage: FC = ({ children }) => {
  return <PageLayout AccessoryNavigation={null}>{children}</PageLayout>;
};

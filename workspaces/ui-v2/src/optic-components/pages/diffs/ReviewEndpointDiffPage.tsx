import * as React from 'react';

import { TwoColumnFullWidth } from '../../layouts/TwoColumnFullWidth';
import { DocumentationRootPage } from '../docs/DocumentationPage';
import { DiffHeader } from '../../diffs/DiffHeader';
import { useEndpoints } from '../../hooks/useEndpointsHook';
import { DiffCard } from '../../diffs/render/DiffCard';

export function ReviewEndpointDiffPage(props: any) {
  const { match } = props;
  const { method, pathId } = match.params;

  const endpoints = useEndpoints().endpoints;

  console.log(endpoints);

  return (
    <TwoColumnFullWidth
      left={
        <>
          <DiffHeader name={'HELLO WORLD' + method + pathId}></DiffHeader>
          <DiffCard />
        </>
      }
      right={<DocumentationRootPage />}
    />
  );
}

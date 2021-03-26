import * as React from 'react';
import { TwoColumnFullWidth } from '../../layouts/TwoColumnFullWidth';
import { DiffHeader } from '../../diffs/DiffHeader';
import { useEndpoints } from '../../hooks/useEndpointsHook';
import { DiffCard } from '../../diffs/render/DiffCard';
import { makeStyles } from '@material-ui/styles';
import { IChangeType } from '../../../lib/Interfaces';
import { code, plain } from '../../diffs/render/ICopyRender';
import { EndpointDocumentationPane } from './EndpointDocumentationPane';
import { useEndpointDiffs } from '../../hooks/diffs/useEndpointDiffs';

export function ReviewEndpointDiffPage(props: any) {
  const { match } = props;
  const { method, pathId } = match.params;

  const endpointDiffs = useEndpointDiffs(pathId, method);

  return (
    <TwoColumnFullWidth
      left={
        <>
          <DiffHeader name={'Review (3) Endpoint Diffs'} />
          <DiffCard
            changeType={IChangeType.Added}
            suggestions={[
              {
                action: {
                  activeTense: [
                    plain('make field'),
                    code('hello'),
                    plain('optional'),
                  ],
                  pastTense: [],
                },
                commands: [],
                changeType: IChangeType.Added,
              },
              {
                action: {
                  activeTense: [plain('remove field'), code('hello')],
                  pastTense: [],
                },
                commands: [],
                changeType: IChangeType.Removed,
              },
            ]}
          />
        </>
      }
      right={<EndpointDocumentationPane method={method} pathId={pathId} />}
    />
  );
}

const useStyles = makeStyles((theme) => ({
  scroll: {
    overflow: 'scroll',
  },
}));

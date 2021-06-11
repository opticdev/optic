import React from 'react';
import { Typography } from '@material-ui/core';
import { TwoColumn } from './TwoColumn';
import { BodyRender } from './BodyRender';
import { ContributionGroup } from './ContributionGroup';
import { MarkdownBodyContribution } from './MarkdownBodyContribution';
import { useShapeDescriptor } from '<src>/hooks/useShapeDescriptor';
import { IChanges } from '<src>/pages/changelog/IChanges';
import { ChangeLogBG } from '<src>/pages/changelog/components/ChangeLogBG';

type SharedProps = {
  location: string;
  contentType: string;
  changes?: IChanges;
  bodyId: string;
  rootShapeId: string;
};

type OneColumnBodyProps = SharedProps & {
  changesSinceBatchCommitId?: string;
};

export type TwoColumnBodyProps = SharedProps & {
  description: string;
};
const TwoColumnBodyEditableUnMemoized = (
  props: TwoColumnBodyProps & {
    endpoint: {
      pathId: string;
      method: string;
    };
  }
) => {
  const shapeChoices = useShapeDescriptor(props.rootShapeId, undefined);
  return (
    <TwoColumn
      id={props.bodyId}
      style={{ marginTop: 50 }}
      left={
        <>
          <div style={{ paddingBottom: 15 }}>
            <Typography variant="h6">{props.location}</Typography>
            <MarkdownBodyContribution
              id={props.bodyId}
              contributionKey={'description'}
              defaultText={'Add a description'}
              initialValue={props.description}
              endpoint={props.endpoint}
            />
          </div>
          <ContributionGroup
            rootShape={shapeChoices}
            endpoint={props.endpoint}
          />
        </>
      }
      right={
        <BodyRender
          location={props.contentType}
          shape={shapeChoices}
          style={{ marginTop: 35 }}
        />
      }
    />
  );
};

// Memoize this as there could be a large number of contribution groups
export const TwoColumnBodyEditable = React.memo(
  TwoColumnBodyEditableUnMemoized
);

export function OneColumnBody(props: OneColumnBodyProps) {
  const shapeChoices = useShapeDescriptor(
    props.rootShapeId,
    props.changesSinceBatchCommitId
  );

  return (
    <div style={{ width: '100%' }} id={props.bodyId}>
      <ChangeLogBG changes={props.changes}>
        <Typography variant="h6">{props.location}</Typography>
        <BodyRender
          location={props.location + ' ' + props.contentType}
          shape={shapeChoices}
          style={{ marginTop: 20 }}
        />
      </ChangeLogBG>
    </div>
  );
}

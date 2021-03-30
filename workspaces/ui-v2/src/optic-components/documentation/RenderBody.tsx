import * as React from 'react';
import { Typography } from '@material-ui/core';
import { TwoColumn } from './TwoColumn';
import { BodyRender } from './BodyRender';
import { ContributionGroup } from './ContributionGroup';
import { MarkdownBodyContribution } from './MarkdownBodyContribution';
import { useShapeDescriptor } from '../hooks/useShapeDescriptor';

export type TwoColumnBodyProps = {
  location: string;
  bodyId: string; //@aidan make sure this name/value makes sense
  rootShapeId: string;
};

export function TwoColumnBody(props: TwoColumnBodyProps) {
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
            />
          </div>
          <ContributionGroup rootShape={shapeChoices} />
        </>
      }
      right={
        <BodyRender
          location="application/json"
          shape={shapeChoices}
          style={{ marginTop: 35 }}
        />
      }
    />
  );
}

export function OneColumnBody(props: TwoColumnBodyProps) {
  const shapeChoices = useShapeDescriptor(props.rootShapeId, undefined);
  return (
    <div style={{ width: '100%' }} id={props.bodyId}>
      <Typography variant="h6">{props.location}</Typography>
      <BodyRender
        location="application/json"
        shape={shapeChoices}
        style={{ marginTop: 20 }}
      />
    </div>
  );
}

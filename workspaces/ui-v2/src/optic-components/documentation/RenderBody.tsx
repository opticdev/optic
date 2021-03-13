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
  rootShapeId: string
};

export function TwoColumnBody(props: TwoColumnBodyProps) {
  const shapeChoices = useShapeDescriptor(props.rootShapeId, undefined);
  return (
    <TwoColumn
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

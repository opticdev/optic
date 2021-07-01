import React from 'react';
import { Typography } from '@material-ui/core';
import { BodyRender } from './BodyRender';
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

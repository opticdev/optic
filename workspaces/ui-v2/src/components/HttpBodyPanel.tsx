import React, { FC } from 'react';

import { IShapeRenderer, ShapeRenderer } from './ShapeRenderer';
import { Panel } from './Panel';

type HttpBodyPanelProps = {
  shapes: IShapeRenderer[];
  location: string;
};

export const HttpBodyPanel: FC<HttpBodyPanelProps> = ({ shapes, location }) => {
  return (
    <Panel header={location}>
      <ShapeRenderer showExamples={false} shapes={shapes} />
    </Panel>
  );
};

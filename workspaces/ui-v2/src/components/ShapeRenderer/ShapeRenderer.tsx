import React, { FC } from 'react';
import { ShapeRenderStore } from './ShapeRenderContext';
import { RenderRootShape } from './ShapeRowBase';
import { IShapeRenderer } from './ShapeRenderInterfaces';

type ShapeRendererProps = {
  showExamples: boolean;
  shape: IShapeRenderer[];
};

export const ShapeRenderer: FC<ShapeRendererProps> = ({
  showExamples,
  shape,
}) => {
  return (
    <ShapeRenderStore showExamples={showExamples}>
      <RenderRootShape shape={shape} />
    </ShapeRenderStore>
  );
};

import React, { FC } from 'react';
import { ShapeRenderStore } from './ShapeRenderContext';
import { RenderRootShape, OneOfRender } from './ShapeRowBase';
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
      {shape.length > 1 ? (
        <OneOfRender shapes={shape} parentShapeId={'root'} />
      ) : (
        <RenderRootShape shape={shape} />
      )}
    </ShapeRenderStore>
  );
};

import React, { FC } from 'react';
import { ShapeRenderStore } from './ShapeRenderContext';
import { RenderRootShape, OneOfRender } from './ShapeRowBase';
import { IShapeRenderer } from './ShapeRenderInterfaces';

type ShapeRendererProps = {
  showExamples: boolean;
  shapes: IShapeRenderer[];
};

export const ShapeRenderer: FC<ShapeRendererProps> = ({
  showExamples,
  shapes,
}) => {
  return (
    <ShapeRenderStore showExamples={showExamples}>
      {shapes.length > 1 ? (
        <OneOfRender shapes={shapes} parentShapeId={'root'} />
      ) : shapes.length === 1 ? (
        <RenderRootShape shape={shapes[0]} />
      ) : null}
    </ShapeRenderStore>
  );
};

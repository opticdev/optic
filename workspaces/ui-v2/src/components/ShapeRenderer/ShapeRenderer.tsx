import React, { FC } from 'react';
import { ShapeRenderStore } from './ShapeRenderContext';
import { RenderRootShape, OneOfRender } from './ShapeRowBase';
import { IShapeRenderer } from '<src>/types';

type ShapeRendererProps = {
  showExamples: boolean;
  shapes: IShapeRenderer[];
  selectedFieldId?: string | null;
};

export const ShapeRenderer: FC<ShapeRendererProps> = ({
  showExamples,
  shapes,
  selectedFieldId,
}) => {
  return (
    <ShapeRenderStore
      showExamples={showExamples}
      selectedFieldId={selectedFieldId}
    >
      {shapes.length > 1 ? (
        <OneOfRender shapes={shapes} parentShapeId={'root'} />
      ) : shapes.length === 1 ? (
        <RenderRootShape shape={shapes[0]} />
      ) : null}
    </ShapeRenderStore>
  );
};

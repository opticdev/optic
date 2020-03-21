import React from 'react'
import {GenericContextFactory} from '../../../contexts/GenericContextFactory';

const {
  Context: ShapeRenderContext,
  withContext: withShapeRenderContext
} = GenericContextFactory(null)

class ShapeRenderStore extends React.Component {
  render() {
    const context = {
      shapeRender: this.props.shape,
      rootId: this.props.shape.rootId,
      diffDescription: this.props.diffDescription,
      suggestion: this.props.suggestion,
      diff: this.props.diff,
    }

    return (
      <ShapeRenderContext.Provider value={context}>
        {this.props.children}
      </ShapeRenderContext.Provider>
    )
  }
}

export {
  ShapeRenderStore,
  withShapeRenderContext
}

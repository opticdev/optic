import React, { useContext, useState } from 'react';
import { GenericContextFactory } from '../../../../contexts/GenericContextFactory';

const {
  Context: ShapeRenderContext,
  withContext: withShapeRenderContext,
} = GenericContextFactory(null);

function ShapeRenderStore(props) {
  const [compassState, setCompassState] = useState({
    isAbove: false,
    isBelow: false,
    x: null,
    width: null,
  });

  const context = {
    shapeRender: props.shape,
    rootId: props.shape.rootId,
    diffDescription: props.diffDescription,
    suggestion: props.suggestion,
    diff: props.diff,
    exampleOnly: props.exampleOnly,
    hideDivider: props.hideDivider,
    compassState,
    setCompassState,
  };

  return (
    <ShapeRenderContext.Provider value={context}>
      {props.children}
    </ShapeRenderContext.Provider>
  );
}

export { ShapeRenderStore, ShapeRenderContext, withShapeRenderContext };

export function useDiff() {
  const context = useContext(ShapeRenderContext);

  if (!context)
    throw Error('useDiff can only be used inside provided ShapeRenderContext');

  return {
    diff: context.diff,
    diffDescription: context.diffDescription,
  };
}

// Expand and Show States
const {
  Context: ShapeExpandedContext,
  withContext: withShapeExpandedContext,
} = GenericContextFactory(null);

class ShapeExpandedStore extends React.Component {
  state = {
    collapsedIds: new Set(),
    showAllLists: new Set(),
  };

  render() {
    const context = {
      collapsedIds: Array.from(this.state.collapsedIds),
      showAllLists: Array.from(this.state.showAllLists),

      setCollapsedIds: (id, include) => {
        if (include) {
          this.state.collapsedIds.add(id);
        } else {
          this.state.collapsedIds.delete(id);
        }
        this.setState({ collapsedIds: this.state.collapsedIds });
      },
      setShowAllLists: (id, include) => {
        if (include) {
          this.state.showAllLists.add(id);
        } else {
          this.state.showAllLists.delete(id);
        }
        this.setState({ showAllLists: this.state.showAllLists });
      },
    };

    return (
      <ShapeExpandedContext.Provider value={context}>
        {this.props.children}
      </ShapeExpandedContext.Provider>
    );
  }
}

export { ShapeExpandedStore, ShapeExpandedContext, withShapeExpandedContext };

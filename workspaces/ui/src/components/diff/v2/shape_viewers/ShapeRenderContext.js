import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
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

export function useCompassTargetTracker(isEnabled) {
  const elementRef = useRef(null);
  const animationRaf = useRef(null);
  const context = useContext(ShapeRenderContext);

  if (!context)
    throw Error(
      'useCompassTargetTracker can only be used inside provided ShapeRenderContext'
    );

  const { compassState, setCompassState } = context;

  const onAnimationFrame = useCallback(() => {
    if (!isEnabled || !window) return;
    const trackedEl = elementRef.current;

    if (!trackedEl) return;

    const viewportHeight = window.innerHeight;
    const boundingRect = trackedEl.getBoundingClientRect();

    const isAbove = boundingRect.bottom < 100;
    const isBelow = boundingRect.top - viewportHeight > 0;
    const { x, width } = boundingRect;

    if (
      isAbove !== compassState.isAbove ||
      isBelow !== compassState.isBelow ||
      x !== compassState.x ||
      width !== compassState.width
    ) {
      setCompassState({
        isAbove,
        isBelow,
        x,
        width,
      });
    }

    animationRaf.current = requestAnimationFrame(onAnimationFrame);
  }, [
    compassState.isAbove,
    compassState.isBelow,
    compassState.x,
    compassState.width,
  ]);

  useEffect(() => {
    animationRaf.current = requestAnimationFrame(onAnimationFrame);
    return () => cancelAnimationFrame(animationRaf.current);
  }, [onAnimationFrame]);

  return elementRef;
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

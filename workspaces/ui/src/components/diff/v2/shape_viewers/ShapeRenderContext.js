import React from 'react'
import {GenericContextFactory} from '../../../../contexts/GenericContextFactory';

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
      exampleOnly: this.props.exampleOnly,
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
  ShapeRenderContext,
  withShapeRenderContext
}

// Expand and Show States
const {
  Context: ShapeExpandedContext,
  withContext: withShapeExpandedContext
} = GenericContextFactory(null)

class ShapeExpandedStore extends React.Component {

  state = {
    collapsedIds: new Set(),
    showAllLists: new Set()
  }

  render() {

    const context = {
      collapsedIds: Array.from(this.state.collapsedIds),
      showAllLists: Array.from(this.state.showAllLists),

      setCollapsedIds: (id, include) => {
        if (include) {
          this.state.collapsedIds.add(id)
        } else {
          this.state.collapsedIds.delete(id)
        }
        this.setState({collapsedIds: this.state.collapsedIds})
      },
      setShowAllLists: (id, include) => {
        if (include) {
          this.state.showAllLists.add(id)
        } else {
          this.state.showAllLists.delete(id)
        }
        this.setState({showAllLists: this.state.showAllLists})
      }
    }

    return (
      <ShapeExpandedContext.Provider value={context}>
        {this.props.children}
      </ShapeExpandedContext.Provider>
    )
  }
}

export {
  ShapeExpandedStore,
  ShapeExpandedContext,
  withShapeExpandedContext
}

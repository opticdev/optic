import React from 'react';
import {GenericContextFactory} from './GenericContextFactory';
const {
  Context: ShapeDialogContext,
  withContext: withShapeDialogContext
} = GenericContextFactory(null);

class ShapeDialogStore extends React.Component {

  state = {
    shapeIds: [],
    examples: null
  };

  close = () => this.setState({shapeIds: [], examples: null})
  pushToStack = (id, examples = null) => this.setState({shapeIds: [...this.state.shapeIds, id], examples})
  back = () => {
    const n = [...this.state.shapeIds]
    n.pop()
    this.setState({shapeIds: n})
  }

  render() {

    const open = this.state.shapeIds.length > 0
    const shapeId =  this.state.shapeIds[this.state.shapeIds.length - 1]
    const context = {
      shapeDialog: {
        open,
        shapeId,
        examples: this.state.examples || [],
        close: this.close,
        pushToStack: this.pushToStack,
        hasPrevious: this.state.shapeIds.length > 1,
        back: this.back
      }
    };

    return (
      <ShapeDialogContext.Provider value={context}>
        {this.props.children}
      </ShapeDialogContext.Provider>
    );
  }
}

export {
  ShapeDialogStore,
  withShapeDialogContext
};


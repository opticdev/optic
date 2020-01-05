import React from 'react';
import {GenericContextFactory} from '../../contexts/GenericContextFactory';
import equal from 'deep-equal';

const {
  Context: HighlightedIDsContext,
  withContext: withHighlightedIDs
} = GenericContextFactory(null);

class HighlightedIDsStore extends React.Component {

  shouldComponentUpdate(nextProps, nextState, nextContext) {

    if (!equal(this.props.addedIds, nextProps.addedIds) ||
      !equal(this.props.changedIds, nextProps.changedIds) ||
      !equal(this.props.expand, nextProps.expand)) {
      return true;
    }

  }

  render() {
    const context = {
      addedIds: this.props.addedIds || [],
      changedIds: this.props.changedIds || [],
      expand: this.props.expand || [],
    };

    return (
      <HighlightedIDsContext.Provider value={context}>
        {this.props.children}
      </HighlightedIDsContext.Provider>
    );
  }
}

export {
  HighlightedIDsStore,
  withHighlightedIDs
};


export const AddedGreen = '#008d69';
export const ChangedYellow = '#8d7200';
export const Highlight = withHighlightedIDs(({addedIds, changedIds, id, children, style}) => {

  if (changedIds.includes(id)) {
    return (<div style={{backgroundColor: ChangedYellow}}>{children}</div>);
  } else if (addedIds.includes(id)) {
    if (style) {
      return (<div style={style}>{children}</div>);
    }
    return (<div style={{backgroundColor: AddedGreen}}>{children}</div>);
  } else {
    return children;
  }
});

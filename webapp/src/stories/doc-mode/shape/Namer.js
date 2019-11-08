import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import {GenericContextFactory} from '../../../contexts/GenericContextFactory';
  
const {
  Context: NamerContext,
  withContext: withNamer
} = GenericContextFactory(null)

class NamerStore extends React.Component {
  render() {
    const context = {
      nameShape: this.props.nameShape || (() => {})
    }

    return (
      <NamerContext.Provider value={context}>
        {this.props.children}
      </NamerContext.Provider>
    )
  }
}

export {
  NamerStore,
  withNamer
}

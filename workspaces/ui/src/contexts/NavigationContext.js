import React from 'react';
import {GenericContextFactory} from './GenericContextFactory';
import {withRouter} from 'react-router-dom';

const {
  Context: NavigationContext,
  withContext: withNavigationContext
} = GenericContextFactory({});

class NavigationStoreBase extends React.Component {

  pushRelative = (url) => {
    const {baseUrl, history} = this.props;
    const goTo = `${baseUrl}${url}`
    history.push(goTo);
  }

  render() {
    const {baseUrl} = this.props;
    const context = {
      baseUrl,
      pushRelative: this.pushRelative
    };

    return (
      <NavigationContext.Provider value={context}>
        {this.props.children}
      </NavigationContext.Provider>
    );
  }
}

const NavigationStore = withRouter(NavigationStoreBase);

export {
  NavigationContext,
  withNavigationContext,
  NavigationStore
};

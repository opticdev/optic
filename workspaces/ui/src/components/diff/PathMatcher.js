import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import UrlToPath from './UrlToPath';
import isEqual from 'lodash.isequal';
import { pathComponentsToString } from './review-diff/learn-api/LearnAPIPageContext';

const styles = (theme) => ({
  pathWrapper: {
    padding: 7,
    fontWeight: 400,
    backgroundColor: '#f6f6f6',
  },
});

class PathMatcher extends React.Component {
  handlePathComponentsChange = (pathComponents) => {
    const pathExpression = pathComponentsToString(pathComponents);
    this.props.onChange({
      pathExpression,
      pathComponents,
      hasParameters: pathComponents.some((i) => i.isParameter),
    });
  };

  render() {
    const {
      classes,
      url,
      rowId,
      onUserCompleted,
      toDocument,
      pathExpressions,
    } = this.props;
    return (
      <div>
        <UrlToPath
          url={url}
          key={'path-match' + rowId}
          onUserCompleted={onUserCompleted}
          onAccept={(pathComponents) => {
            this.handlePathComponentsChange(pathComponents);
          }}
        />
      </div>
    );
  }
}

export default withStyles(styles)(PathMatcher);

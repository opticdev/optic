import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import PathInput from '../paths/PathInput';
import pathToRegexp from 'path-to-regexp';
import Typography from '@material-ui/core/Typography';
import {pathComponentsToString} from '../paths/NewUnmatchedUrlWizard';
import UrlToPath from "./UrlToPath";

const styles = theme => ({
  pathWrapper: {
    padding: 7,
    fontWeight: 400,
    backgroundColor: '#f6f6f6'
  }
});

class PathMatcher extends React.Component {

  handlePathComponentsChange = (pathComponents) => {
    const pathExpression = pathComponentsToString(pathComponents);
    this.props.onChange({
      pathExpression
    });
  };

  render() {
    const {classes, url} = this.props;

    return (
      <div>
        <div className={classes.pathWrapper}>
          <UrlToPath url={url} onAccept={(pathComponents) => {
            this.handlePathComponentsChange(pathComponents)
          }}/>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(PathMatcher);

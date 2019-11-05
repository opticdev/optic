import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {withEditorContext} from '../../contexts/EditorContext';
import PathInput from '../path-editor/PathInput';
import pathToRegexp from 'path-to-regexp';
import {pathComponentsToString} from './UnmatchedUrlWizard';
import Typography from '@material-ui/core/Typography';
import HelpIcon from '@material-ui/icons/HelpOutline';
import {primary} from '../../theme';
import {Tooltip} from '@material-ui/core';

const styles = theme => ({
  pathWrapper: {
    padding: 7,
    fontWeight: 400,
    backgroundColor: '#eeeeee'
  }
});

class PathMatcher extends React.Component {

  state = {
    pathExpression: this.props.initialPathString,
  };

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.url !== this.props.url) {
      this.setState({
        pathExpression: nextProps.initialPathString,
      })
    }
  }

  handlePathComponentsChange = (pathComponents) => {
    const pathExpression = pathComponentsToString(pathComponents);
    this.setState({pathExpression});
    this.props.onChange({
      pathExpression
    });
  };

  render() {
    const {classes, url} = this.props;
    const {pathExpression} = this.state;

    const regex = pathToRegexp(pathExpression, [], {end: false});
    const found = url.match(regex);

    let matched = '';
    let remaining = url;

    if (found && found[0].length) {
      const startString = found[0];
      const start = url.substring(0, startString.length);
      matched = start;
      remaining = url.substring(startString.length);
    }

    return (
      <div>
        <Typography variant="overline" style={{paddingBottom: 0, marginTop: 11}}>Observed URL:</Typography>
        <div className={classes.pathWrapper}><span
          style={{color: '#277a4e', fontWeight: 800}}>{matched}</span><span>{remaining}</span></div>


        <div style={{display: 'flex', flexDirection: 'row'}}>
          <Typography variant="overline" style={{marginBottom: 0}}>Path:</Typography>
        </div>

        <div className={classes.pathWrapper}>
          <PathInput
            targetUrl={url}
            onChange={this.handlePathComponentsChange}
            onSubmit={() => {
            }}
            initialPathString={pathExpression}
          />
        </div>
      </div>
    );
  }
}

export default withEditorContext(withStyles(styles)(PathMatcher));

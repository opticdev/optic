import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import { withEditorContext } from '../../contexts/EditorContext';
import PathInput from '../path-editor/PathInput';
import pathToRegexp from 'path-to-regexp';
import { pathComponentsToString } from './UnrecognizedPathWizard';
import Typography from '@material-ui/core/Typography'

const styles = theme => ({
    pathWrapper: {
        padding: 7,
        fontWeight: 400,
        backgroundColor: '#f6f6f6'
    }
});

class PathMatcher extends React.Component {

    state = {
        pathExpression: this.props.initialPathString,
    };

    handlePathComponentsChange = (pathComponents) => {
        const pathExpression = pathComponentsToString(pathComponents)
        this.setState({ pathExpression });
        this.props.onChange({
            pathExpression
        })
    };

    render() {
        const { classes, url } = this.props;
        const { pathExpression } = this.state;

        const regex = pathToRegexp(pathExpression, [], {end: false})
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
                <Typography variant="overline" style={{ paddingBottom: 0 }}>Path:</Typography>
                <div className={classes.pathWrapper}><span
                    style={{ color: '#277a4e', fontWeight: 800 }}>{matched}</span><span>{remaining}</span></div>

                <Typography variant="overline" style={{ marginBottom: 0 }}>Provide Path Matcher:</Typography>
                <div className={classes.pathWrapper}>
                    <PathInput
                        onChange={this.handlePathComponentsChange}
                        onSubmit={() => {}}
                        initialPathString={pathExpression}
                    />
                </div>
            </div>
        );
    }
}

export default withEditorContext(withStyles(styles)(PathMatcher));
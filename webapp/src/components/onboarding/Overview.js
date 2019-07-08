import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Typography from '@material-ui/core/Typography';
import {primary} from '../../theme';
import Button from '@material-ui/core/Button';
import Editor from '../navigation/Editor';
import {EditorModes, withEditorContext} from '../../contexts/EditorContext';
import {withRfcContext} from '../../contexts/RfcContext';
import {FullSheet} from '../navigation/Editor.js';
import {addAbsolutePath} from '../utilities/PathUtilities';
import sortBy from 'lodash.sortby';
import classNames from 'classnames';
import BasicButton from '../shape-editor/BasicButton';
import {routerUrls} from '../../routes';
import {Link} from 'react-router-dom';
import CreateNew from '../navigation/CreateNew';

const styles = theme => ({
    root: {
        padding: 22,
        paddingTop: 35
    },
    pathButton: {
        padding: 5,
        fontSize: 15,
        fontWeight: 200,
        '&:hover': {
            color: primary,
            fontWeight: 400
        }
    },
    actions: {
        padding: 15,
        marginLeft: -35,
        marginTop: 15,
        border: '1px solid #e2e2e2',
        borderRadius: 8
    },
    actionButton: {
        float: 'right',
        marginTop: -22
    }
});

function ifNotLocalHost(component) {
    return (window.location.host.startsWith( 'localhost' )) ? null : component
}


class OverView extends React.Component {

    componentDidMount() {

        const {switchEditorMode} = this.props
        const {pathIdsWithRequests} = this.props.cachedQueryResults

        if (pathIdsWithRequests.size === 0) {
            setTimeout(() => {
                switchEditorMode(EditorModes.DESIGN)
            }, 1)
        }

    }

    render() {
        const {classes, apiName} = this.props;

        return (
            <Editor>
                <FullSheet>
                    <div className={classes.root}>
                        <Typography variant="h2" color="primary">{apiName}</Typography>

                        {ifNotLocalHost(<>
                        <Typography variant="h5" color="primary" style={{ marginTop: 22}}>Getting Started</Typography>
                            <iframe src="https://www.loom.com/embed/f22363d617b140e5ba682348a6c767e9"
                                    frameBorder="0"
                                    style={{width: '100%', height: 500, marginTop: 22}}
                                    webkitallowfullscreen mozallowfullscreen allowFullScreen></iframe>
                        </>)}

                        <ul style={{marginTop: 50}}>
                            <div className={classes.actions}>
                                <Typography variant="subtitle1" color="primary">Add a
                                    Request</Typography>
                                <Typography variant="caption">Define your API's paths, methods, and
                                    responses</Typography>
                                <CreateNew render={({addRequest}) => (
                                    <Button color="secondary" variant="contained" className={classes.actionButton}
                                            onClick={addRequest}>New Request</Button>
                                )}/>
                            </div>
                            <div className={classes.actions}>
                                <Typography variant="subtitle1" color="primary">Add a
                                    Concept</Typography>
                                <Typography variant="caption">Define the shape of all the concepts in your
                                    API</Typography>
                                <CreateNew render={({addConcept}) => (
                                    <Button color="secondary" variant="contained" className={classes.actionButton}
                                            onClick={addConcept}>New Concept</Button>
                                )}/>
                            </div>
                            <div className={classes.actions}>
                                <Typography variant="subtitle1" color="primary">Upload OpenAPI spec</Typography>
                                <Typography variant="caption">Already have an OpenAPI spec? Upload it to Seamless to get started</Typography>
                                <Button href="/upload-oas" color="secondary" variant="contained"
                                        className={classes.actionButton}>Upload OAS</Button>
                            </div>
                            <div className={classes.actions}>
                                <Typography variant="subtitle1" color="primary">Read the Docs</Typography>
                                <Typography variant="caption">Learn about Seamless, our roadmap, and how to use the
                                    API designer </Typography>
                                <Button href="https://seamlessapis.com" color="secondary" variant="contained"
                                        className={classes.actionButton}>Open Docs</Button>
                            </div>
                        </ul>


                        {ifNotLocalHost(<>
                        <Typography variant="h5" color="primary" style={{ marginTop: 22}}>Using Seamless with Your API</Typography>
                        <iframe src="https://www.loom.com/embed/9b419421c5354ac7aac7bc640f4e7726"
                                frameBorder="0"
                                style={{width: '100%', height: 500, marginTop: 22}}
                                webkitallowfullscreen mozallowfullscreen allowFullScreen></iframe>
                        </>)}
                    </div>
                </FullSheet>
            </Editor>
        );
    }
}

export default withRfcContext(withEditorContext(withStyles(styles)(OverView)));

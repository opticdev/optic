import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {withRfcContext} from '../contexts/RfcContext';
import Typography from '@material-ui/core/Typography';
import {ShapeCommands} from '../engine';
import {FullSheet} from './navigation/Editor.js';
import SchemaEditor from './shape-editor/SchemaEditor';
import {withEditorContext} from '../contexts/EditorContext';
import ContributionTextField from './contributions/ContributionTextField';
import {updateContribution} from '../engine/routines';
import Editor from './navigation/Editor';
import {track} from '../Analytics';
import Helmet from 'react-helmet';

const styles = theme => ({
    root: {
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 15
    },
    schemaEditorContainer: {
        marginTop: 5,
        // backgroundColor: '#fafafa'
    }
});

class ConceptsPage extends React.Component {
    renderMissing() {
        return (
            <Typography>This Concept does not exist</Typography>
        )
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.conceptId !== this.props.conceptId) {
            track('Loaded Concept')
        }
    }

    render() {
        const {classes, conceptId, handleCommand, modeOverride, cachedQueryResults, queries, apiName} = this.props;
        let mode = modeOverride || this.props.mode;
        const {contributions} = cachedQueryResults;

        let conceptResult = null;
        try {
            conceptResult = queries.conceptById(conceptId);
        } catch (e) {
            console.error(e)
            return this.renderMissing()
        }

        const {allowedReferences, concept} = conceptResult
        const currentShape = concept;

        return (
            <Editor>
                <Helmet><title>{currentShape.namedConcept.name} -- {apiName}</title></Helmet>
                <FullSheet>
                    <div className={classes.root}>
                        <ContributionTextField
                            key={`${conceptId}-name`}
                            value={currentShape.namedConcept.name}
                            variant={'heading'}
                            placeholder={'Concept Name'}
                            mode={mode}
                            onBlur={(value) => {
                                const command = ShapeCommands.SetConceptName(value, conceptId)
                                handleCommand(command)
                            }}
                        />

                        <ContributionTextField
                            key={conceptId}
                            value={contributions.getOrUndefined(conceptId, 'description')}
                            variant={'multi'}
                            placeholder={'Description'}
                            mode={mode}
                            onBlur={(value) => {
                                handleCommand(updateContribution(conceptId, 'description', value));
                            }}
                        />


                        <div className={classes.schemaEditorContainer}>
                            <SchemaEditor
                                conceptId={conceptId}
                                currentShape={currentShape}
                                allowedReferences={allowedReferences}
                                mode={mode}
                                handleCommand={handleCommand}
                            />
                        </div>

                        {/*<Divider style={{marginTop: 15, marginBottom: 15}} />*/}

                        {/*<Typography variant="h6" color="primary">Usages</Typography>*/}

                    </div>
                </FullSheet>
            </Editor>
        );
    }
}

export default withEditorContext(withRfcContext(withStyles(styles)(ConceptsPage)));

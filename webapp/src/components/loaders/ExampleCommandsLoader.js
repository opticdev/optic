import React from 'react';
import { InitialRfcCommandsStore } from '../../contexts/InitialRfcCommandsContext';
import { RfcStore } from '../../contexts/RfcContext';
import { TutorialStore } from '../../contexts/TutorialContext';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button
} from '@material-ui/core'
import Loading from '../../components/navigation/Loading';
import { APIEditorRoutes } from '../../routes';


class ExampleCommandsLoader extends React.Component {

    state = {
        example: null,
        error: null
    };

    componentDidMount() {
        fetch(`/example-commands/${this.props.match.params.exampleId}-commands.json`)
            .then(response => {
                if (response.ok) {
                    return response.text()
                        .then(rawString => {
                            if (rawString.startsWith('<!DOCTYPE html>')) {
                                this.setState({ error: true });
                            } else {
                                this.setState({
                                    example: rawString
                                });
                            }
                        });
                }
            });
    }

    render() {
        const { example, error } = this.state;

        if (error) {
            return (
                <Dialog open={true}>
                    <DialogTitle>Example not found</DialogTitle>
                    <DialogContent>The example API you are trying to load could not be found.</DialogContent>
                    <DialogActions>
                        <Button onClick={() => window.location.reload()}>Reload</Button>
                        <Button onClick={() => window.location.href = '/new'} color="secondary">Start New API</Button>
                    </DialogActions>
                </Dialog>
            );
        }

        if (example === null) {
            return <Loading />;
        }
        return (
            <InitialRfcCommandsStore initialCommandsString={example} rfcId="testRfcId">
                <RfcStore>
                    <TutorialStore>
                        <APIEditorRoutes {...this.props} />
                    </TutorialStore>
                </RfcStore>
            </InitialRfcCommandsStore>
        );
    }
}

export default ExampleCommandsLoader
import {GenericContextFactory} from './GenericContextFactory';
import * as React from 'react';
import {track} from '../Analytics';

const {
    Context: EditorContext,
    withContext: withEditorContext
} = GenericContextFactory(null)


const EditorModes = {
    DOCUMENTATION: 'documentation',
    DESIGN: 'design',
}

class EditorStore extends React.Component {

    state = {
        mode: EditorModes.DESIGN
    }

    switchEditorMode = (mode) => {
        track("Switched Editor Mode", {mode});
        if (Object.values(EditorModes).includes(mode)) {
            this.setState({mode})
        }
    }

    render() {

        const {mode} = this.state
        const {baseUrl} = this.props

        const context = {mode, switchEditorMode: this.switchEditorMode, baseUrl}

        return (
            <EditorContext.Provider value={context}>
                {this.props.children}
            </EditorContext.Provider>
        )
    }
}

export {
    EditorStore,
    EditorContext,
    withEditorContext,
    EditorModes
}


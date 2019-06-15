import {GenericContextFactory} from './GenericContextFactory';
import * as React from 'react';

const {
	Context: EditorContext,
	withContext: withEditorContext
} = GenericContextFactory(null)

class EditorStore extends React.Component {

	state = {
		mode: EditorModes.DOCUMENTATION
	}

	switchEditorMode = (mode) => {
		if (Object.values(EditorModes).includes(mode)) {
			this.setState({mode})
		}
	}

	render() {

		const {mode} = this.state
		const {basePath} = this.props

		return (
			<EditorContext.Provider value={{mode, switchEditorMode: this.switchEditorMode, basePath}}>
				{this.props.children}
			</EditorContext.Provider>
		)
	}
}

const EditorModes = {
	DOCUMENTATION: 'documentation',
	DESIGN: 'design',
}

export {
	EditorStore,
	EditorContext,
	withEditorContext,
	EditorModes
}


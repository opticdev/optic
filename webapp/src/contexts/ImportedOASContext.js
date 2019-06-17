import {GenericContextFactory} from './GenericContextFactory';
import * as React from 'react';

const {
	Context: ImportedOASContext,
	withContext: withImportedOASContext
} = GenericContextFactory(null)

class ImportedOASStore extends React.Component {

	state = {
		providedCommands: null
	}

	setProvidedCommands = (commandString, callback) => {
		this.setState({providedCommands: commandString}, callback)
	}

	clear = (callback) => {
		this.setState({providedCommands: null}, callback)
	}

	render() {

		const {providedCommands} = this.state
		return (
			<ImportedOASContext.Provider value={{providedCommands, setProvidedCommands: this.setProvidedCommands, clear: this.clear}}>
				{this.props.children}
			</ImportedOASContext.Provider>
		)
	}
}

export {
	ImportedOASStore,
	ImportedOASContext,
	withImportedOASContext
}


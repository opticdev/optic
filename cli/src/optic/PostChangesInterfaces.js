
//Insert locations
export function AsChildOf(
	file,
	position) {
	return {
		file,
		position,
		type: 'AsChildOf'
	}
}

export function Clipboard() {
	return {
		type: 'Clipboard'
	}
}

//File Changes
export function FileContentsUpdate(
	file,
	originalFileContents,
	newFileContents) {
	return {
		file, originalFileContents, newFileContents,
		type: 'FileContentsUpdate'
	}
}


//Optic Changes
export function InsertModel(
	schemaRef,
	generatorId,
	value,
	atLocation) {
	return {
		schemaRef, generatorId, value, atLocation,
		type: 'InsertModel'
	}
}

export function RunTransformation(
	transformationRef,
	inputValue,
	inputModelId,
	inputModelName,
	generatorId,
	location,
	answers) {
	return {
		transformationRef, inputValue, inputModelId, inputModelName, generatorId, location, answers,
		type: 'RunTransformation'
	}
}


export function ChangeGroup(arr) {
	return arr
}

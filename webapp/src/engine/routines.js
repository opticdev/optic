import {RfcCommands, ShapesCommands} from './index';

export function updateContribution(id, key, value) {
	return RfcCommands.AddContribution(id, key, value)
}

export function renameShape(shapeId, name) {
	return ShapesCommands.RenameShape(shapeId, name)
}

export function renameAPI(newName) {
	return RfcCommands.SetAPIName(newName)
}


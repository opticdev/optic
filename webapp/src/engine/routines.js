import {RfcCommands} from './index';

export function updateContribution(id, key, value) {
	return RfcCommands.AddContribution(id, key, value)
}

export function renameAPI(newName) {
	return RfcCommands.SetAPIName(newName)
}

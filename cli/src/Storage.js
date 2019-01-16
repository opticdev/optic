import config from "./config";
import storage from 'node-persist'

let storageRef = null

export function initStorage() {
	if (storageRef === null) {
		storageRef = storage.initSync({dir: config.storageDirectory, forgiveParseErrors: true})
		storage.setItemSync('setup', true)
	}

	return storage

}

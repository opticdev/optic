import {AgentConnection} from "optic-editor-sdk";
import config from '../config'
let _agentConnection = null

export function agentConnection(connectCallback) {
	if (!_agentConnection) {
		_agentConnection = AgentConnection({name: config.projectDirectory})
	}

	if (typeof connectCallback === 'function') {
		_agentConnection.onConnect(connectCallback)
	}

	return _agentConnection
}

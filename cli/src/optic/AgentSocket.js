import {AgentConnection} from "optic-editor-sdk";
import config from '../config'
import colors from 'colors'

let _agentConnection = null

export function agentConnection(connectCallback) {
	if (!_agentConnection) {
		_agentConnection = AgentConnection({name: config.projectDirectory})

		setInterval(() => {
			_agentConnection.socket.send('ping')
		}, 30000)
	}

	if (typeof connectCallback === 'function') {
		_agentConnection.onConnect(connectCallback)
	}

	return _agentConnection
}

export function closeConnection() {
	agentConnection().socket.close()
	process.exit()
}

export function shouldStart() {
	return new Promise((resolve, reject) => {
		const agentC = agentConnection(() => {
			resolve(agentC)
		})

		agentC.onError((e) => {
			console.error(colors.red(`Current directory does not include Optic project. Run 'optic init' to create one`))
			process.exit(0)
		})
	})
}

export function catchProjectErrors() {
	agentConnection().onStatusChange(({status}) => {
		if (status.hasErrors) {
			console.log(colors.red('Optic Project Error: \n\n'+ status.errors.join('\n')))
			process.exit(1)
		}
	})
}

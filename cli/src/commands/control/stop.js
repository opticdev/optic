import kill from 'kill-port'

const successText = 'Optic server stopped'
const failureText = 'Optic server is not running'

export const stopCmd = {
	name: 'stop',
	description: 'stops local Optic server',
	action: () => {
		kill('30333')
			.then(i=> console.log(successText))
			.catch(i=> console.log(failureText))
	}
}

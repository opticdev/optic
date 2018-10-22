import exec from 'sync-exec'

const successText = 'Optic server stopped'
const failureText = 'Optic server is not running'

export const stopCmd = {
	name: 'stop',
	action: () => {

		const results = exec('/usr/sbin/lsof -n -iTCP:30333')

		if (results.stdout) {
			const output = results.stdout
			if (output.includes('(LISTEN)')) {
				const pid = output.split('\n')[1].split(/\s+/)[1]
				exec(`kill ${pid}`)
				console.log(successText)
			} else {
				console.log(failureText)
			}
		} else {
			console.log(failureText)
		}
	}
}

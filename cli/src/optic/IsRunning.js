import niceTry from 'nice-try'
import request from "request";
export function serverStatus(versionVerify) {

	return new Promise((resolve, reject) => {
		request.get('http://localhost:30334/ping', (err, response, body) => {
			if (!err && body) {
				resolve({
					isRunning: true,
				})
			} else {
				resolve({
					isRunning: false,
				})
			}
		})
	})

}

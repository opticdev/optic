import niceTry from 'nice-try'
import request from "request";
export function serverStatus(versionVerify) {

	return new Promise((resolve, reject) => {
		request.get('http://localhost:30333/sdk-version', {qs: {'v': versionVerify}}, (err, response, body) => {
			if (!err && body) {
				resolve({
					isRunning: true,
					support: niceTry(()=> JSON.parse(body))
				})
			} else {
				resolve({
					isRunning: false,
				})
			}
		})
	})

}

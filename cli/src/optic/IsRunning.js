import exec from 'sync-exec'
import niceTry from 'nice-try'
export function serverStatus(versionVerify) {
	const result = exec(`curl localhost:30333/sdk-version?v=${versionVerify}`)

	return {
		isRunning: result.status === 0,
		support: niceTry(()=> JSON.parse(result.stdout))
	}
}

import colors from 'colors'
import config from '../../config'
import niceTry from 'nice-try'
import {Spinner} from 'cli-spinner'


export const stageCmd = {
	name: 'stage',
	description: 'upload spec to useoptic.com',
	action: (cmd) => {
		console.log('stage')
	}
}

//
// export async function getStagedSpec(cmd, shouldPublish = false) {
//
// 	const repoInfo = await new Promise(((resolve, reject) => {
// 		gitInfo.isGit(config.projectDirectory, (exists) => {
// 			if (!exists) resolve({branch: 'master', commitName: 'HEAD', isDirty: false})
//
// 			gitInfo.check(config.projectDirectory, (err, {dirty, branch}) =>  {
// 				if (err) reject(err)
// 				const message =  niceTry(() => gitInfo.messageSync(config.projectDirectory))
// 				if (shouldPublish) {
// 					resolve({branch, commitName: message || 'HEAD', isDirty: dirty !== 0})
// 				} else {
// 					resolve({branch, commitName: 'HEAD', isDirty: dirty !== 0})
// 				}
// 			})
// 		})
// 	}))
//
// 	if (repoInfo.isDirty && shouldPublish) {
// 		console.error(colors.red(`Can not publish spec because project repo is dirty. Please commit and try again. If you are debugging, prefer 'optic stage'`))
// 		closeConnection()
// 	}
//
//
// 	let spinner = startSpinner('Reading project...')
//
// 	setTimeout(() => {
// 		agentConnection().actions.startRuntimeAnalysis()
// 	}, 500)
//
// 	agentConnection().onRuntimeAnalysisStarted((data) => {
// 		if (data.isSuccess) {
// 			spinner = startSpinner('Running tests...', spinner)
// 			runTest(data.testcmd, true, true) //keeps it locked after running tests so file don't get updated from tests
// 		} else {
// 			spinner.stop()
// 			console.log(colors.yellow(`Warning: Could not run tests. Try 'optic runtests' to debug`))
// 			startSnapshot()
// 		}
// 	})
//
// 	let runtimeIssues = []
// 	agentConnection().onRuntimeAnalysisFinished(({isSuccess, results, error}) => {
// 		if (isSuccess) {
// 			console.log(colors.green(`Runtime analysis completed`))
// 			runtimeIssues = results.issues
// 		} else {
// 			console.log(colors.yellow(`Error executing Runtime analysis. Run 'optic readtests' to debug further. `))
// 		}
// 		startSnapshot()
// 	})
//
//
// 	function startSnapshot() {
// 		spinner = startSpinner('Generating Project Spec...', spinner)
// 		agentConnection().actions.prepareSnapshot()
//
// 	}
//
// 	agentConnection().onSnapshotDelivered((data) => {
// 		spinner.stop()
// 		console.log('\n')
// 		console.log(colors.green('Snapshot Generated'))
// 		console.log(colors.green(`${data.snapshot.apiSpec.endpoints.length} endpoints documented`))
//
// 		//add runtime issues to project issues
// 		data.snapshot.projectIssues = [...data.snapshot.projectIssues, ...runtimeIssues]
//
// 		console.log(JSON.stringify(data.snapshot))
//
// 		PostSnapshot(data.snapshot.name, {snapshot: data.snapshot, opticVersion: pJson.version, branch: repoInfo.branch, commitName: repoInfo.commitName, published: shouldPublish})
// 			.then((response) => processResult(response))
// 			.catch((error) => {
// 				if (!error.response) {
// 					console.log(colors.red("\nCould not save project snapshot to server. Check internet connection"))
// 				} else {
// 					console.log(JSON.stringify(error.response.body))
// 					if (error.statusCode === 401 || error.statusCode === 403) {
// 						console.log(colors.red(`\nCould not save project snapshot to server. Client is not authorized. Run 'optic adduser' authenticate this client.`))
// 						closeConnection()
// 					}
// 					console.log("\nCould not save project snapshot to server. " + colors.red(error.response.body))
// 				}
// 				closeConnection()
// 			})
// 	})
//
// 	async function processResult({projectId, branch, uuid}) {
// 		console.log('\nPress (return) to view, (r) to refresh, or any other key to exit')
// 		const cmd = await keypress()
// 		switch (cmd) {
// 			case 'exit': closeConnection()
// 			case 'open': {
// 				opn(`http://localhost:3000/#/projects/${projectId}/?branch=${encodeURIComponent(branch)}&version=${uuid}`)
// 				closeConnection()
// 				break;
// 			}
// 			case 'refresh': {
// 				clear()
// 				agentConnection().actions.startRuntimeAnalysis()
// 				break;
// 			}
// 		}
// 	}
//
// }
//
// function startSpinner(message, lastSpinner) {
// 	if (lastSpinner) {
// 		lastSpinner.stop()
// 	}
// 	const s = new Spinner(`${message} %s`);
// 	s.setSpinnerString(18)
// 	s.start();
// 	return s
// }
//
// const keypress = async () => {
// 	process.stdin.setRawMode(true)
// 	return new Promise((resolve, reject) => process.stdin.once('data', (data) => {
// 		const byteArray = [...data]
//
// 		let command = null
// 		if (byteArray.length > 0 && byteArray[0] == 13) {
// 			command = 'open'
// 		} else if (byteArray.length > 0 && byteArray[0] == 114) {
// 			command = 'refresh'
// 		} else {
// 			command = 'exit'
// 		}
//
// 		if (!command) {
// 			process.stdin.setRawMode(false)
// 		} else {
// 			resolve(command)
// 		}
// 	}))
// }

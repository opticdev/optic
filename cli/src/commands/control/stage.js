import colors from 'colors'
import niceTry from 'nice-try'
import {Spinner} from 'cli-spinner'
import requestp from 'request-promise'
import gitInfo from 'git-state'
import inquirer from 'inquirer'
import config from '../../config'
import {exec} from "child_process";
import pJson from '../../../package'
import {PostSnapshot} from "../../api/Requests";
import prettyjson from 'prettyjson'
export const stageCmd = {
	name: 'stage',
	description: 'upload spec to useoptic.com',
	action: (cmd, config) => watchTests(config, false)
}


export async function watchTests(projectConfig, shouldPublish, justPrint) {

	const spinner = new Spinner('Connecting to Optic... %s');
	spinner.setSpinnerString(18);
	spinner.start();

	const repoInfo = await new Promise(((resolve, reject) => {
		gitInfo.isGit(config.projectDirectory, (exists) => {
			if (!exists) resolve({branch: 'master', commitName: 'HEAD', isDirty: false})
			gitInfo.check(config.projectDirectory, (err, {dirty, branch}) =>  {
				if (err) reject(err)
				const message =  niceTry(() => gitInfo.messageSync(config.projectDirectory))
				if (shouldPublish) {
					resolve({branch, commitName: message || 'HEAD', isDirty: dirty !== 0})
				} else {
					resolve({branch, commitName: 'HEAD', isDirty: dirty !== 0})
				}
			})
		})
	}))

	if (repoInfo.isDirty && shouldPublish) {
		console.error(colors.red(`\nCan not publish spec because project repo is dirty. Please commit and try again. If you are debugging, prefer 'optic stage'`))
		process.exit(0)
	}

	const validStart = await requestp.post({uri: 'http://localhost:30334/start', json: projectConfig, qs: {reset: true}})
		.then((response) => true)
		.catch((err) => {
			if (err.statusCode === 405) {
				console.log(colors.red('\nOptic is already watching a test session. Please wait for that to finish and try again.'))
				return false
			} else {
				console.log(colors.red('\nUnable to connect to Optic Proxy. Please restart the server and try again'))
				return false
			}
		})

	if(!validStart) process.exit(0)
	spinner.setSpinnerTitle('Starting test session... %s')

	const testSuccess = await runTest(projectConfig.test, false)
	spinner.stop()

	const {continueUpload} = (testSuccess) ? await {continueUpload: true} : await inquirer.prompt([{type: 'confirm', name: 'continueUpload', message: 'Some tests failed, do you still want to proceed?'}])

	spinner.setSpinnerTitle('Processing Observations...')
	spinner.start()


	const data = await requestp.post({uri: 'http://localhost:30334/end'})
		.then((response) => {
			return JSON.parse(response)
		})
		.catch((err) => {
			console.log(colors.red('\nUnable to process API Spec. '+ err.message))
			return false
		})
		.finally()

	spinner.stop(true)
	displayReport(data)

	if (justPrint) {
		data.apiSpec.endpoints.forEach((endpoint) => {
			delete endpoint.issues
			console.log(colors.bold(`------ ${endpoint.method} ${endpoint.url} ------\n`))
			console.log(prettyjson.render(endpoint))
			console.log('\n\n')
		})
		process.exit(0)
	}

	PostSnapshot(projectConfig.name, {snapshot: data, opticVersion: pJson.version, branch: repoInfo.branch, commitName: repoInfo.commitName, published: shouldPublish}, projectConfig.team)
			.then(({projectId, uuid, branch}) => {
				if (shouldPublish) {
					console.log(colors.green('Snapshot uploaded on useoptic.com'))
				} else {
					console.log(colors.green('Snapshot published to useoptic.com'))
				}

				console.log('Click here to open: ' + `http://localhost:3000/#/projects/${projectId}/?branch=${encodeURIComponent(branch)}&version=${uuid}`)
			})
			.catch((error) => {
				if (!error.response) {
					console.log(colors.red("\nCould not save project snapshot to server. Check internet connection"))
				} else {
					if (error.statusCode === 401 || error.statusCode === 403) {
						console.log(colors.red(`\nCould not save project snapshot to server. Client is not authorized. Run 'optic adduser' authenticate this client.`))
					} else if (error.statusCode === 404) {
						console.log(colors.red(`\nProject not found. Make sure you've created a project named '${projectConfig.name}' on useoptic.com`))
					} else {
						console.log("\nCould not save project snapshot to server. " + colors.red(error.response.body))
					}
				}
			})
			.finally(() => process.exit(0))


}

export function runTest(testcmd, silent) {
	return new Promise((resolve, reject) => {
		exec(testcmd, {cwd: config.projectDirectory, stdio: "inherit", env: {...process.env, 'optic-watching': true}}, (err, stdout, stderr) => {
			if (!silent) {
				if (err) {
					console.log(colors.red(stdout+err))
					resolve(false)
				} else {
					console.log(stdout)
					resolve(true)
				}
			}
		})
	})
}


export function displayReport({report, endpoints}) {
	const byPathEntires = Object.entries(report.byPath)
	console.log(colors.green('Analysis Complete!\n'))
	console.log(colors.green(`Documented ${colors.bold(byPathEntires.length)} endpoints from ${colors.bold(report.observations)} tests in ${report.durationMS/1000} seconds`))

	if (byPathEntires.length) {
		console.log(colors.bold('------ Endpoints ------'))
		byPathEntires.map(i => console.log(i[0]))
	}

	if (report.unusedPaths.length) {
		console.log('\n')
		console.log(colors.bold.red('------ Untested Path ------'))
		report.unusedPaths.map(i => console.log(i))
	}

	console.log('\n')
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

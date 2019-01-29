import "regenerator-runtime/runtime";
import path from 'path'
const isDev = false
import fs from 'fs'
import niceTry from 'nice-try'

const jreDirectory = require('os').homedir()+'/.optic-jre'

module.exports = (() => {
	if (isDev) {
		return {
			runServerCmd: {
				options: ['-jar', `${process.cwd()}/jars/optic-proxy.jar`]
			},
			webappHost: 'http://localhost:3000',
			backendHost: 'http://localhost:8081',
			storageDirectory: process.cwd()+'/.optic-storage',
			jreDirectory,
			projectDirectory: '/Users/aidancunniffe/Desktop/test-runtime-code'
		}
	} else {

		const jarPath = path.join(__dirname, '../jars/optic-proxy.jar')

		return {
			runServerCmd: {
				options: ['-jar', jarPath]
			},
			webappHost: 'https://app.useoptic.com',
			backendHost: 'https://api.useoptic.com',
			storageDirectory: require('os').homedir()+'/.optic-storage',
			jreDirectory,
			projectDirectory: process.cwd()
		}
	}

})()

module.exports.isDev = isDev

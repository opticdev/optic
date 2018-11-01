import "regenerator-runtime/runtime";

const isDev = false

module.exports = (() => {
	if (isDev) {
		return {
			runServerCmd: {
				options: ['-jar', `${process.cwd()}/jars/server-assembly.jar`]
			},
			storageDirectory: process.cwd()+'/.optic-storage',
			projectDirectory: '/Users/aidancunniffe/Desktop/optic-demo-project-master'
		}
	} else {
		const appRootPath = require('app-root-path').toString()

		const path = [(appRootPath.endsWith('/lib')) ? '../jars/server-assembly.jar' : 'jars/server-assembly.jar']

		return {
			runServerCmd: {
				options: ['-jar', `${appRootPath}/${path}`]
			},
			storageDirectory: require('os').homedir()+'/.optic-storage',
			projectDirectory: process.cwd()
		}
	}

})()

module.exports.isDev = isDev

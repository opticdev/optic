import {driver} from './jre/jre-install'
import "regenerator-runtime/runtime";

export const isDev = false

export default (() => {

	if (isDev) {
		return {
			runServerCmd: {
				binary: async () => {
					return new Promise(resolve => {
						resolve('/usr/bin/java')
					})
				},
				options: ['-jar', `${process.cwd()}/jars/server-assembly.jar`]
			},
			storageDirectory: process.cwd(),
			projectDirectory: '/Users/aidancunniffe/Desktop/optic-demo-project-master'
		}
	} else {
		const appRootPath = require('app-root-path').toString()

		return {
			runServerCmd: {
				binary: driver,
				options: ['-jar', `${appRootPath}/jars/server-assembly.jar`]
			},
			storageDirectory: require('os').homedir()+'/.optic-storage',
			projectDirectory: process.cwd()
		}
	}

})()


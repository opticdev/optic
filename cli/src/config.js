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
			storageDirectory: process.cwd()+'/.optic-storage',
			projectDirectory: '/Users/aidancunniffe/Desktop/optic-demo-project-master'
		}
	} else {
		const appRootPath = require('app-root-path').toString()

		const path = [(appRootPath.endsWith('/lib')) ? '../jars/server-assembly.jar' : 'jars/server-assembly.jar']

		return {
			runServerCmd: {
				binary: driver,
				options: ['-jar', `${appRootPath}/${path}`]
			},
			storageDirectory: require('os').homedir()+'/.optic-storage',
			projectDirectory: process.cwd()
		}
	}

})()


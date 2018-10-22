import {driver} from './jre/index'
import "regenerator-runtime/runtime";

const isDev = false

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
			projectDirectory: '/Users/aidancunniffe/Desktop/optic-demo-project-master'
		}
	} else {
		return {
			runServerCmd: {
				binary: driver,
				options: ['-jar', `${process.cwd()}/jars/server-assembly.jar`]
			},
			projectDirectory: '/Users/aidancunniffe/Desktop/optic-demo-project-master'
		}
	}

})()


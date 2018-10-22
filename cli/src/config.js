const isDev = true

export default (() => {

	if (isDev) {
		return {
			runServerCmd: {
				binary: '/usr/bin/java',
				options: ['-jar', `${process.cwd()}/jvm/server-assembly.jar`]
			},
			projectDirectory: '/Users/aidancunniffe/Desktop/optic-demo-project-master'
		}
	} else {
		return {
			projectDirectory: process.cwd()
		}
	}

})()


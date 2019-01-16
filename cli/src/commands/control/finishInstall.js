import {setupFlow} from "../SetupFlow";

export const finishInstallCmd = {
	name: 'finishinstall',
	action: (cmd) => {
		console.log('Finishing Installation')
		setupFlow()
		.then((didIt) => {

		})
		.catch((error) => {
			console.log(error)
		})
	}
}

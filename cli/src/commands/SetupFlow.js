import inquirer from 'inquirer'
import p from '../../package'
import colors from 'colors'
import {validate as emailValidate} from 'email-validator'
import {install} from '../jre/jre-install'
import {installPluginsCmd} from "./control/installplugins";
import {startCmd} from "./control/start";
import storage from "node-persist";
import {isDev} from "../config";
import request from 'request'
import {track} from "../Analytics";
import {initStorage} from "../Storage";

export async function setupFlow(justJre) {

	const storage = initStorage()

	if (justJre) {
		return justJreInstall()
	}


	console.log('Welcome to Optic '+colors.yellow(p.version))

	const answers = await inquirer.prompt([
			{
				type: 'input',
				message: 'Please enter your email: ',
				validate: (email) => {
					return (emailValidate(email) || isDev) ? true : 'Invalid email address'
				},
				name: 'email',
			},
			{
				type: 'confirm',
				message: 'Finish Install: Configure local Optic server and install IDE plugins',
				name: 'confirm'
			}
	])

	if (answers.confirm) {
		storage.setItemSync('firstRun', true)
		storage.setItemSync('email', answers.email)

		if (isDev) {
			console.log(colors.green('Setup Complete!\n\n')+`You can check out our docs at ${colors.blue('https://useoptic.com/docs')} \nor run 'optic --help'`)
			process.exit(0)
		}

		request.post('https://d1tzgrv7wi.execute-api.us-east-2.amazonaws.com/production/analytics/add-entry',
			{body: JSON.stringify({email: answers.email})},
			(error, response, body) => {})

		console.log(colors.yellow('Installing local Optic server...'))
		install((err) => {
			if (!err) {
				console.log(colors.green('Optic Server Installed'))

				console.log(colors.yellow('Installing IDE Plugins...'))


				const done = () => {
					console.log('\n\n')
					console.log(colors.green('Setup Complete!\n\n') + `You can check out our docs at ${colors.blue('https://useoptic.com/docs')} \nor run 'optic --help'`)
					process.exit(0)
				}

				if (process.platform === 'darwin') {
					installPluginsCmd.action(() => {
						done()
					})
				} else {
					done()
				}


			} else {
				track('Could not install Optic server ')
				console.log(colors.red('Optic server could not be installed.' + err))
				process.exit(1)
			}
		})
	} else {
		track('Canceled Install')
		console.log(colors.red(`Installation cancelled. Run 'optic' anytime to restart.`))
	}

}

async function justJreInstall() {

	const answers = await inquirer.prompt([
		{
			type: 'confirm',
			message: 'Finish Install: Configure local Optic server.',
			name: 'confirm'
		}
	])

	if (answers.confirm) {

		console.log(colors.yellow('Installing local Optic server...'))
		install((err) => {
			if (!err) {
				console.log(colors.green('Optic Server Installed'))
			} else {
				track('Could not install Optic server ')
				console.log(colors.red('Optic server could not be installed.' + err))
				process.exit(1)
			}
		})

	}
}

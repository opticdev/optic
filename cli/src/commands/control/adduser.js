import inquirer from "inquirer";
import fs from "fs";
import clear from 'clear'
import colors from "colors";
import opn from 'opn'
import {LoginUserRequest} from "../../api/Requests";
import keytar from 'keytar'
export const adduserCmd = {
	name: 'adduser',
	description: 'connect to your Optic account',
	action: (cmd) => {
		console.log('Generate a new token or copy one from useoptic.com. Navigating to account page now...')
		setTimeout(() => {
			opn('https://app.useoptic.com/#/account')
		}, 3000)
		inquirer
			.prompt([
				{
					type: 'input',
					message: 'Paste your API Token:',
					name: 'token',
				},

			]).then((answers) => {
			keytar.setPassword('optic-cli', 'main', answers.token.trim())
			console.log('\nSuccess. Token Saved.')
			process.exit()
		})
	}
}

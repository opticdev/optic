import inquirer from "inquirer";
import {projectFileGenerator} from "../../optic/ProjectFileGenerator";
import fs from 'fs'
import colors from 'colors'

export const initCmd = {
	name: 'init',
	options: [
		["--presets [string]", 'included skills']
	],
	description: 'creates an Optic project',
	action: (cmd) => {
		const args = cmd.rawArgs
		const prefixIndex = args.indexOf('--presets')

		const skills = (() => {
			if (prefixIndex !== -1) {
				return args.slice(prefixIndex+1)
			} else {
				return []
			}
		})()

		inquirer
			.prompt([
				{
					type: 'input',
					message: 'Project Name:',
					name: 'projectName',
				}])
			.then((answers) => {
				const contents = projectFileGenerator(answers.projectName, skills)
				const fp = process.cwd()+'/optic.yml'
				fs.writeFile(fp, contents, (err) => {
					if (err) console.log(colors.red('Could not create optic.yml file: '+ err));

					console.log('Project file created: '+ colors.yellow(fp));
				});
			})

	}
}

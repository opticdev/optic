import colors from 'colors'
import {watchTests} from "./stage";

export const publishCmd = {
	name: 'publish',
	description: 'publish new version of spec to useoptic.com',
	options: [],
	action: (cmd) => (cmd, config) => watchTests(config, true)
}

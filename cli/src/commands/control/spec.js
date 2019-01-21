import colors from 'colors'
import {watchTests} from "./stage";

export const specCmd = {
	name: 'spec',
	description: 'outputs the API Spec to stdout',
	action: (cmd, config) => watchTests(config, false, true)
}

import yaml from 'js-yaml'
import fs from 'fs'
import Joi from 'joi'
import pathToRegexp from 'path-to-regexp'


export const opticConfigType = Joi.object().keys({
	name: Joi.string().min(3).max(30).required(),
	test: Joi.string().min(1).required(),
	host: Joi.string().alphanum().min(1).required(),
	port: Joi.number().integer().required(),
	paths: Joi.array().items(Joi.string()).required()
})

export function parseOpticYaml(file) {

	try {
		const doc = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
		const result = Joi.validate(doc, opticConfigType)
		if (result.error) {
			return {config: null, error: result.error.message}
		} else {

			doc.paths = doc.paths.map(pathToHint)

			return {config: doc, error: null}
		}
	} catch (e) {
		return {config: null, error: 'Could not parse optic.yaml file: '+ e}
	}

}

export function pathToHint(path) {
	const keys = []
	const regexp = pathToRegexp(path, keys, {sensitive: true}).toString()
	const jvmSafeRegex = regexp.substring(1, regexp.length - 1)
	return {
		path,
		regex: jvmSafeRegex,
		namedParameters: keys.map(i => i.name)
	}
}

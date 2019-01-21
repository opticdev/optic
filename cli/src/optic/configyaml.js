import yaml from 'js-yaml'
import fs from 'fs'
import Joi from 'joi'
import pathToRegexp from 'path-to-regexp'


export const authConfigType = Joi.alternatives(
	Joi.string().valid('basic', 'bearer'),
	Joi.object().keys({
		type: Joi.string().valid('apiKey').required(),
		in: Joi.string().valid('cookie', 'query', 'header').required(),
		name: Joi.string().required().min(1)
}))
export const opticConfigType = Joi.object().keys({
	name: Joi.string().min(3).max(30).required(),
	team: Joi.string().min(3),

	test: Joi.string().min(1).required(),

	host: Joi.string().alphanum().min(1).required(),
	port: Joi.number().integer().required(),

	authentication: authConfigType,

	paths: Joi.array().items(Joi.string()).required(),
})

export function parseOpticYaml(file) {

	try {
		const doc = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
		const result = Joi.validate(doc, opticConfigType)
		if (result.error) {
			return {config: null, error: result.error.message}
		} else {

			doc.paths = doc.paths.map(pathToHint)

			if (doc.authentication) {
				if (typeof doc.authentication === 'string') {
					doc.authentication = {type: doc.authentication}
				}
			}

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

import assert from 'assert'
import {opticConfigType, parseOpticYaml, pathToHint} from "../configyaml";
import Joi from 'joi'
describe.only('optic yaml', () => {

	describe('validation', () => {

		it('will reject an invalid yaml', () => {
			const result = Joi.validate({name: 'Valid', host: undefined}, opticConfigType)
			assert(result.error)
		})

		it('will reject if paths contains something other than strings', () => {
			const result = Joi.validate({name: 'Valid', host: 'localhost', port: 20222, paths: ['/login', 45, []]}, opticConfigType)
			assert(result.error)
		})

		it('will accept a valid yaml', () => {
			const result = Joi.validate({name: 'Valid', host: 'localhost', port: 20222, paths: ['/login']}, opticConfigType)
			assert(!result.error)
		})
	})

	describe.only('path to url hint', () => {

		it('works for path w/ no parameters', () => {
			const hint = pathToHint('/login')
			assert(hint.path === '/login')
			assert(hint.regex === `^\\/login(?:\\/)?$`)
			assert(hint.namedParameters.length === 0)
		})

		it('works for path w/ starting parameters', () => {
			const hint = pathToHint('/:bar')
			assert(hint.path === '/:bar')
			assert(hint.regex === `^\\/([^\\/]+?)(?:\\/)?$`)
			assert.deepStrictEqual(hint.namedParameters, ['bar'])
		})

		it('works for path w/ multiple parameters', () => {
			const hint = pathToHint('/:bar/:foo/profile/relations-:interactionId')
			assert(hint.path === '/:bar/:foo/profile/relations-:interactionId')
			assert(hint.regex === `^\\/([^\\/]+?)\\/([^\\/]+?)\\/profile\\/relations-([^-\\/]+?)(?:\\/)?$`)
			assert.deepStrictEqual(hint.namedParameters, ['bar', 'foo', 'interactionId'])
		})

	})


	const valid = 'src/optic/__test/valid.yaml'
	const syntaxerror = 'src/optic/__test/syntaxerror.yaml'

	it('can parse an example file', () => {
		const result = parseOpticYaml(valid)
		assert(result.config)
		assert(!result.error)
	})

	it('will fail if invalid yaml', () => {
		const result = parseOpticYaml(syntaxerror)
		assert(!result.config)
		assert(result.error)
	})

})

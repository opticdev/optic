import assert from 'assert'
import {readPrimitiveValue} from "../FieldInterpreter";

describe('read primitive value', () => {
	it('works on strings', () => {
		assert(readPrimitiveValue('hello', 'string') === 'hello')
	})

	it('works on booleans', () => {
		assert(readPrimitiveValue('true', 'boolean') === true)
		assert(readPrimitiveValue('false', 'boolean') === false)
	})

	it('works on numbers', () => {
		assert(readPrimitiveValue('354', 'number') === 354)
	})

})

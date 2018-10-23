import assert from 'assert'
import {lengthMinusTags} from "../LengthMinusTags";

describe('Length minus tags', () => {

	it('will give the proper length of a normal string', () => {
		assert(lengthMinusTags('abc') === 3)
		assert(lengthMinusTags('abc def') === 7)
	})

	it('will give the proper length of a string with tags', () => {
		assert(lengthMinusTags('a {tagA} bc') === 5)
		assert(lengthMinusTags('abc{tagB}def') === 6)
		assert(lengthMinusTags('{red-fg}No IDE Connected{/}') === 16)
	})

})

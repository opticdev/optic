import assert from 'assert'
import {fuzzySearch} from "../FuzzySearch";

describe('fuzzy search', () => {

	const haystack = [{id: 'a', _string: 'apple'}, {id: 'o', _string: 'orange'}, {id: 'as', _string: 'apple sauce'}]

	it('can filter by string', () => {
		const results = fuzzySearch('apple', haystack)
		assert.deepEqual(results.strings, [ 'apple', 'apple sauce' ])
		assert.deepEqual(results.objects, [
			{ id: 'a', _string: 'apple' },
			{ id: 'as', _string: 'apple sauce' }
		])
	})

	it('returns all when needle empty', () => {
		assert.deepEqual(fuzzySearch('', haystack).strings, [ 'apple', 'orange', 'apple sauce' ])
	})

	it('returns none when needle is not within haystack', () => {
		assert.deepEqual(fuzzySearch('zzz', haystack).strings, [ ])
	})

})

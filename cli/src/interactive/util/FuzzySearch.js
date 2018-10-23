import fuzzy from 'fuzzy'
export function fuzzySearch(needle, array) {
	const results = fuzzy.filter(needle, array, {
		extract: (i) => i._string
	})

	return {strings: results.map((i) => i.string), objects: results.map((i) => i.original)}
}

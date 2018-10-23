String.prototype.replaceAll = function(search, replacement) {
	const target = this;
	return target.replace(new RegExp(search, 'g'), replacement);
}

export function lengthMinusTags(string) {
	const tagRegex = /{.*?}/
	return string.replaceAll(tagRegex, '').length
}

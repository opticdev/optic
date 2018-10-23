export function toggleOnAssertion(assertion, nodeId, screen) {
	if (assertion) {
		screen.getRawNodeById(nodeId).show()
	} else {
		screen.getRawNodeById(nodeId).hide()
	}
}

export function toggleNoneOnAssertion(assertion, node, doIfTrue) {
	if (assertion) {
		node.show()
		if (typeof doIfTrue === 'function') {
			doIfTrue()
		}
	} else {
		node.hide()
	}
}

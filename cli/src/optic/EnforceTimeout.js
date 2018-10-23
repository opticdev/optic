import colors from 'colors'
export function enforceTimeout(duration, error) {
	const status = {
		conditionMet: false
	}

	const trigger = () => status.conditionMet = true

	setTimeout(() => {
		if (!status.conditionMet) {
			console.log(colors.red(error))
			process.exit(0)
		}
	}, duration)

	return trigger
}

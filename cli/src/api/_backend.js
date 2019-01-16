import rp from 'request-promise'
import keytar from "keytar";
export const backendRequest = rp.defaults({baseUrl: 'http://localhost:8081/'})

export const getAuth = () => keytar.findPassword('optic-cli')

export const authenticated = async (options = {}) => {
	const token = await getAuth()
	if (token) {
		return {...options, headers: {...options.headers, 'Authentication': 'Bearer '+token}}
	} else {
		return options
	}
}

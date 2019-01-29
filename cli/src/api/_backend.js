import rp from 'request-promise'
import keytar from "keytar";
import config from '../config'


export const backendRequest = rp.defaults({baseUrl: config.backendHost})

export const getAuth = () => keytar.findPassword('optic-cli')

export const authenticated = async (options = {}) => {
	const token = await getAuth()
	if (token) {
		return {...options, headers: {...options.headers, 'Authentication': 'Bearer '+token}}
	} else {
		return options
	}
}

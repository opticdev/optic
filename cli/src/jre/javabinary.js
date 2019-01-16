import {isDev} from '../config'
import {driver} from './jre-install'
const devBinary = async () => {
	return new Promise(resolve => {
		resolve('/usr/bin/java')
	})
}

export const javabinary = (isDev) ? devBinary : driver

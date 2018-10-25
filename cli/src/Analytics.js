import Mixpanel from 'mixpanel'
import storage from 'node-persist'
export const tracker = Mixpanel.init('fb0a1c90dc672a2898099cce41930b12');
import p from '../package'
import {isDev} from './config'

export async function getEmail() {
	return await storage.getItem('email')
}

export async function track(event, data = {}) {
	if (!isDev) {
		tracker.track(event, {
			distinct_id: await getEmail(),
			optic_version: p.version,
			...data
		});
	}
}

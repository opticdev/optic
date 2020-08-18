import React, { useMemo } from 'react';
import axios from 'axios';

const SpecViewerDataContext = React.createContext(null);
SpecViewerDataContext.displayName = 'SpecViewerDataContext';
SpecViewerDataContext.debugSession = true;

// only expose the Provider component, but hide the Consumer in favour of hooks
export const { Provider } = SpecViewerDataContext;

function createSpecSession(specId) {

	
  let fetchedData = null;
  async function getData(refresh = false) {
    if (!fetchedData || refresh) {
		const ApiUrl = 'http://localhost:4000/api/v1';
		fetchedData = axios({
			method: 'get',
			url: `${ApiUrl}/sharing/public/spec-urls/${specId}`
		}).then(response => {
			console.log(response)
			const data = {
				events: response.data,
				examples: {},
				session: {
					metadata: {
					completed: true,
					},
					samples: [],
					links: [
						{
							rel: 'next',
							href: '',
						},
					],
				},
			};
			console.log(data);
			return data;
		})

      
    }
    return await fetchedData;
  }

  return {
    specId,
    getData,
  };
}

export function useSpecSession(specId) {
  const dashboardContext = useMemo(() => createSpecSession(specId), [specId]);
  return dashboardContext;
}

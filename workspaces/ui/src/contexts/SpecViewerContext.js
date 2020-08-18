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
		const BucketHost = 'http://localhost:9090';
		fetchedData = axios({
			method: 'get',
			url: `${BucketHost}/shared-specs/${specId}`
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

import React, { useMemo } from 'react';

const SpecViewerDataContext = React.createContext(null);
SpecViewerDataContext.displayName = 'SpecViewerDataContext';
SpecViewerDataContext.debugSession = true;

// only expose the Provider component, but hide the Consumer in favour of hooks
export const { Provider } = SpecViewerDataContext;

function createSpecSession(specId) {

	
  let fetchedData = null;
  async function getData(refresh = false) {
    if (!fetchedData || refresh) {
		const ApiUrl = `${process.env.REACT_APP_API_URL}/api/v1`;

		const response = await fetch(`${ApiUrl}/sharing/public/spec-urls/${specId}`);
		const data = await response.json();
		fetchedData = {
			events: data,
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

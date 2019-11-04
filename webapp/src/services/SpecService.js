class SpecService {
    async saveEvents(eventStore, rfcId) {
        const serializedEvents = eventStore.serializeEvents(rfcId);
        return fetch(`/cli-api/events`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: serializedEvents
        });
    }

    async saveDiffState(sessionId, diffState) {
        return fetch(`/cli-api/sessions/${sessionId}/diff`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(diffState)
        })
    }

    async loadSession(sessionId) {
        const promises = [
            fetch(`/cli-api/sessions/${sessionId}`)
                .then((response) => {
                    if (response.ok) {
                        return response.json()
                    }
                    return response.text()
                        .then((text) => {
                            throw new Error(text)
                        })
                }),
            fetch(`/cli-api/sessions/${sessionId}/diff`)
                .then((response) => {
                    if (response.ok) {
                        return response.json()
                    }
                    return response.text()
                        .then((text) => {
                            throw new Error(text)
                        })
                })
        ]
        return Promise.all(promises)
            .then(([sessionResponse, diffStateResponse]) => {
                return {
                    sessionResponse,
                    diffStateResponse
                }
            })
    }
}

const specService = new SpecService()

export {
    SpecService,
    specService
}
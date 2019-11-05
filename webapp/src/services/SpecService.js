class SpecService {
    getJson(url) {
        return fetch(url, {
            headers: {
                'accept': 'application/json',
            }
        })
            .then((response) => {
                if (response.ok) {
                    return response.json()
                }
                return response.text()
                    .then((text) => {
                        throw new Error(text)
                    })
            })
    }


    putJson(url, body) {
        return fetch(url, {
            method: 'PUT',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json'
            },
            body
        })
    }
    
    listSessions() {
        return this.getJson(`/cli-api/sessions`)
    }

    getCommandContext() {
        return this.getJson(`/cli-api/command-context`)
    }

    saveEvents(eventStore, rfcId) {
        const serializedEvents = eventStore.serializeEvents(rfcId);
        return this.putJson(`/cli-api/events`, serializedEvents);
    }

    saveDiffState(sessionId, diffState) {
        return this.putJson(`/cli-api/sessions/${sessionId}/diff`, JSON.stringify(diffState))
    }

    loadSession(sessionId) {
        const promises = [
            this.getJson(`/cli-api/sessions/${sessionId}`),
            this.getJson(`/cli-api/sessions/${sessionId}/diff`)
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
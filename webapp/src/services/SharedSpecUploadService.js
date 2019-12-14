import { NetworkUtilities } from './SpecService'

class SharedSpecUploadService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl
    }

    save(sharedSpecRepresentation) {
        return fetch(`${this.baseUrl}/saved`, {
            method: 'POST'
        })
            .then(NetworkUtilities.handleJsonResponse)
            .then(body => {
                const { id, upload_url } = body;
                return fetch(upload_url, {
                    method: 'PUT',
                    body: JSON.stringify(sharedSpecRepresentation)
                })
                    .then(() => {
                        return {
                            id
                        }
                    })
            })
            .catch(e => {
                console.error(e)
                throw new Error()
            })
    }

    load(id) {
        return fetch(`${this.baseUrl}/saved/${id}`)
            .then(NetworkUtilities.handleJsonResponse)
            .then(body => {
                const { download_url } = body
                return fetch(download_url)
                    .then(NetworkUtilities.handleJsonResponse)
            })
            .catch((e) => {
                console.error(e);
                return {
                    events: [],
                    exampleRequests: {}
                }
            })
    }
}

const sharedSpecUploadService = new SharedSpecUploadService('https://fiddleapi.useoptic.com')
global.sharedSpecUploadService = sharedSpecUploadService

export {
    SharedSpecUploadService,
    sharedSpecUploadService
}
class ExportUtilities {
    static async toSharedSpecRepresentation(state) {
        const {
            parentId,
            eventStore,
            specService,
            cachedQueryResults,
            rfcId,
        } = state;

        const events = JSON.parse(eventStore.serializeEvents(rfcId))
        const { requests } = cachedQueryResults
        debugger
        const exampleRequestsList = await Promise.all(
            Object
                .keys(requests)
                .map(async (requestId) => {
                    const { examples } = await specService.listExamples(requestId)
                    return { [requestId]: examples }
                })
        )
        const exampleRequests = exampleRequestsList
            .reduce((acc, value) => {
                return Object.assign(acc, value)
            }, {})


        const spec = {
            parentId,
            events,
            exampleRequests
        }
        return spec;
    }
}

global.ExportUtilities = ExportUtilities


export {
    ExportUtilities
}
import {getNormalizedBodyDescriptor} from '../components/PathPage.js';

class RequestUtilities {
    static hasBody(bodyDescriptor) {
        return RequestUtilities.hasNormalizedBody(getNormalizedBodyDescriptor(bodyDescriptor))

    }

    static hasNormalizedBody(normalizedBodyDescriptor) {
        const {conceptId, isRemoved} = normalizedBodyDescriptor
        if (conceptId && !isRemoved) {
            return true
        }
        return false
    }

    static canAddBody(request) {
        const {requestDescriptor} = request
        const {httpMethod, bodyDescriptor} = requestDescriptor
        const hasBody = RequestUtilities.hasBody(bodyDescriptor)
        const httpAllowsBodyForMethod = httpMethod !== 'get'
        return !hasBody && httpAllowsBodyForMethod
    }

    static requestName(request, paths) {
        const {requestDescriptor} = request;
        const {httpMethod, pathComponentId} = requestDescriptor
        const path = paths.find(x => x.pathId === pathComponentId)
        return `${httpMethod} ${path.absolutePath}`
    }
}

export {
    RequestUtilities
}
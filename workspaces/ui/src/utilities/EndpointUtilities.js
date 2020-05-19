"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var PathUtilities_1 = require("../components/utilities/PathUtilities");
var ContributionKeys_1 = require("../ContributionKeys");
var RequestUtilities_1 = require("./RequestUtilities");
var lodash_sortby_1 = __importDefault(require("lodash.sortby"));
function getEndpointId(_a) {
    var method = _a.method, pathId = _a.pathId;
    return ContributionKeys_1.pathMethodKeyBuilder(pathId, method);
}
exports.getEndpointId = getEndpointId;
function createEndpointDescriptor(_a, cachedQueryResults) {
    var method = _a.method, pathId = _a.pathId;
    var requests = cachedQueryResults.requests, pathsById = cachedQueryResults.pathsById, requestIdsByPathId = cachedQueryResults.requestIdsByPathId, responsesArray = cachedQueryResults.responsesArray, contributions = cachedQueryResults.contributions;
    var endpointId = getEndpointId({ pathId: pathId, method: method });
    var requestIdsOnPath = (requestIdsByPathId[pathId] || []).map(function (requestId) { return requests[requestId]; });
    var requestsOnPathAndMethod = requestIdsOnPath.filter(function (request) { return request.requestDescriptor.httpMethod === method.toUpperCase(); });
    var fullPath;
    var pathParameters = [];
    //try to resolve this path
    try {
        var pathTrail = PathUtilities_1.asPathTrail(pathId, pathsById);
        var pathTrailComponents = pathTrail.map(function (pathId) { return pathsById[pathId]; });
        var pathTrailWithNames = pathTrailComponents.map(function (pathComponent) {
            var pathComponentName = PathUtilities_1.getNameWithFormattedParameters(pathComponent);
            var pathComponentId = pathComponent.pathId;
            return {
                pathComponentName: pathComponentName,
                pathComponentId: pathComponentId,
            };
        });
        fullPath = pathTrailWithNames
            .map(function (_a) {
            var pathComponentName = _a.pathComponentName;
            return pathComponentName;
        })
            .join('/');
        pathParameters = pathTrail
            .map(function (pathId) { return pathsById[pathId]; })
            .filter(function (p) { return PathUtilities_1.isPathParameter(p); })
            .map(function (p) { return ({
            pathId: p.pathId,
            name: p.descriptor.ParameterizedPathComponentDescriptor.name,
            description: contributions.getOrUndefined(p.pathId, ContributionKeys_1.DESCRIPTION),
        }); });
    }
    catch (e) {
        // TODO figure out what error we would expect for method / pathId we can't find, so
        // we can deal with that explicitly and stop swallowing other errors
        console.log(e);
    }
    if (!fullPath)
        return null; // can not find endpoint requests
    var requestBodies = requestsOnPathAndMethod.map(function (_a) {
        var requestId = _a.requestId, requestDescriptor = _a.requestDescriptor;
        var requestBody = RequestUtilities_1.getNormalizedBodyDescriptor(requestDescriptor.bodyDescriptor);
        return {
            requestId: requestId,
            requestBody: requestBody,
        };
    });
    var responsesForPathAndMethod = lodash_sortby_1["default"](responsesArray
        .filter(function (response) {
        return response.responseDescriptor.httpMethod === method.toUpperCase() &&
            response.responseDescriptor.pathId === pathId;
    })
        .map(function (_a) {
        var responseId = _a.responseId, responseDescriptor = _a.responseDescriptor;
        var responseBody = RequestUtilities_1.getNormalizedBodyDescriptor(responseDescriptor.bodyDescriptor);
        return {
            responseId: responseId,
            responseBody: responseBody,
            statusCode: responseDescriptor.httpStatusCode,
        };
    }), ['statusCode']);
    return {
        httpMethod: method,
        method: method,
        pathId: pathId,
        fullPath: fullPath,
        pathParameters: pathParameters,
        requestBodies: requestBodies,
        responses: responsesForPathAndMethod,
        endpointPurpose: contributions.getOrUndefined(endpointId, ContributionKeys_1.PURPOSE),
        endpointDescription: contributions.getOrUndefined(endpointId, ContributionKeys_1.DESCRIPTION),
        isEmpty: requestBodies.length === 0 && responsesForPathAndMethod.length === 0,
    };
}
exports.createEndpointDescriptor = createEndpointDescriptor;

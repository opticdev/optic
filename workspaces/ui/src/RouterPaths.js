export const basePaths = {
    exampleSessionsBasePath: '/example-sessions/:exampleId',
    interceptorBasePath: '/live-session',
    exampleDrivenSpecBasePath: '/spec-by-example',
    exampleCommandsBasePath: '/examples/:exampleId',
    sharedBasePath: '/shared/:sharedId',
    localBasePath: '/specs/:specId',
    localIntegrationsPath: '/specs/:specId/integrations/:integrationName'
}

export const routerPaths = {
    exampleCommandsRoot: () => basePaths.exampleCommandsBasePath,
    exampleSessionsRoot: () => basePaths.exampleSessionsBasePath,
    exampleDrivenRoot: () => basePaths.exampleDrivenSpecBasePath,
    sharedRoot: () => basePaths.sharedBasePath,
    interceptorRoot: () => basePaths.interceptorBasePath,
    localRoot: () => basePaths.localBasePath,
    request: (base) => `${base}/requests/:requestId`,
    pathMethod: (base) => `${base}/paths/:pathId/methods/:method`,
    init: (base) => `${base}/init`,
    apiDashboard: (base) => `${base}/dashboard`,
    apiDocumentation: (base) => `${base}/documentation`,
    integrationsDashboard: (base) => `${base}/integrations`,
    integrationsPath: (base) => `${base}/integrations/:integrationName`,
    diff: (base) => `${base}/diff/:sessionId`,
    diffUrls: (base) => `${base}/urls`,
    diffRequest: (base) => `${base}/requests/:requestId`,
    //@todo -- replace the old flow with this one
    diffRequestNew: (base) => `${base}/paths/:pathId/methods/:method`,
};

export const basePaths = {
    exampleSessionsBasePath: '/example-sessions/:exampleId',
    interceptorBasePath: '/live-session',
    exampleDrivenSpecBasePath: '/spec-by-example',
    exampleCommandsBasePath: '/examples/:exampleId',
    sharedBasePath: '/shared/:sharedId',
    localBasePath: '/saved',
    localIntegrationsPath: '/saved/integrations/:integrationName'
}

export const routerPaths = {
    exampleCommandsRoot: () => basePaths.exampleCommandsBasePath,
    exampleSessionsRoot: () => basePaths.exampleSessionsBasePath,
    exampleDrivenRoot: () => basePaths.exampleDrivenSpecBasePath,
    sharedRoot: () => basePaths.sharedBasePath,
    interceptorRoot: () => basePaths.interceptorBasePath,
    localRoot: () => basePaths.localBasePath,
    request: (base) => `${base}/requests/:requestId`,
    apiDashboard: (base) => `${base}/dashboard`,
    integrationsDashboard: (base) => `${base}/integrations`,
    integrationsPath: (base) => `${base}/integrations/:integrationName`,
    diff: (base) => `${base}/diff/:sessionId`,
    diffUrls: (base) => `${base}/urls`,
    diffRequest: (base) => `${base}/requests/:requestId`,
};

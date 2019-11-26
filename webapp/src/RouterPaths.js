export const basePaths = {
    exampleSessionsBasePath: '/example-sessions/:exampleId',
    interceptorBasePath: '/live-session',
    exampleDrivenSpecBasePath: '/spec-by-example',
    exampleCommandsBasePath: '/examples/:exampleId',
    localBasePath: '/saved'
}

export const routerPaths = {
    exampleCommandsRoot: () => basePaths.exampleCommandsBasePath,
    exampleSessionsRoot: () => basePaths.exampleSessionsBasePath,
    exampleDrivenRoot: () => basePaths.exampleDrivenSpecBasePath,
    interceptorRoot: () => basePaths.interceptorBasePath,
    localRoot: () => basePaths.localBasePath,
    request: (base) => `${base}/requests/:requestId`,
    diff: (base) => `${base}/diff/:sessionId`,
    diffUrls: (base) => `${base}/urls`,
    diffRequest: (base) => `${base}/requests/:requestId`,
};
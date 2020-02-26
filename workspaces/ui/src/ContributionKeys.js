export const PURPOSE = 'purpose'
export const DESCRIPTION = 'description'
export const BODY_DESCRIPTION = 'body_description'

export const pathMethodKeyBuilder = (path, method) => `${path}.${method.toUpperCase()}`
export const requestBodyKeyBuilder = (path, method) => `${pathMethodKeyBuilder(path, method)}.requestBody`
export const responseKeyBuilder = (path, method) => `${pathMethodKeyBuilder(path, method)}.response`

export function isPathParameter(path) {
    if (path.descriptor.ParameterizedPathComponentDescriptor) {
        return true
    }
    return false
}

export function asNormalizedAbsolutePath(pathTrailComponents) {
    if (pathTrailComponents.length === 1) {
        return '/'
    }
    return pathTrailComponents.map((pathTrailComponent) => getNormalizedName(pathTrailComponent)).join('/')
}

export function asAbsolutePath(pathTrailComponents) {
    if (pathTrailComponents.length === 1) {
        return '/'
    }
    return pathTrailComponents.map((pathTrailComponent) => getNameWithFormattedParameters(pathTrailComponent)).join('/')
}

export function getName(path) {
    if (path.descriptor.ParameterizedPathComponentDescriptor) {
        return path.descriptor.ParameterizedPathComponentDescriptor.name
    }
    if (path.descriptor.BasicPathComponentDescriptor) {
        return path.descriptor.BasicPathComponentDescriptor.name
    }
    return null
}

export function getNameWithFormattedParameters(path) {
    if (path.descriptor.ParameterizedPathComponentDescriptor) {
        return `{${path.descriptor.ParameterizedPathComponentDescriptor.name}}`
    }
    if (path.descriptor.BasicPathComponentDescriptor) {
        return path.descriptor.BasicPathComponentDescriptor.name
    }
    return null
}

export function getNormalizedName(path) {
    if (path.descriptor.ParameterizedPathComponentDescriptor) {
        return `{}`
    }
    if (path.descriptor.BasicPathComponentDescriptor) {
        return path.descriptor.BasicPathComponentDescriptor.name
    }
    return null
}

export function getParentPathId(path) {
    if (!path || !path.descriptor) {
        return null
    }
    if (path.descriptor.ParameterizedPathComponentDescriptor) {
        return path.descriptor.ParameterizedPathComponentDescriptor.parentPathId
    }
    if (path.descriptor.BasicPathComponentDescriptor) {
        return path.descriptor.BasicPathComponentDescriptor.parentPathId
    }
    return null
}

export function asPathTrail(pathId, pathsById) {
    let lastPathId = pathId
    let pathTrail = []
    do {
        pathTrail.push(lastPathId)
        const lastPath = pathsById[lastPathId]
        lastPathId = getParentPathId(lastPath)
    } while (lastPathId)
    return pathTrail.reverse()
}

export function asPathTrailComponents(pathId, pathsById) {
    return asPathTrail(pathId, pathsById).map(id => pathsById[id])
}

export function addAbsolutePath(pathId, pathsById) {
    const basePath = pathsById[pathId]
    const pathTrail = asPathTrail(pathId, pathsById)
    const pathTrailComponents = pathTrail.map(x => pathsById[x])
    return {
        ...basePath,
        normalizedAbsolutePath: asNormalizedAbsolutePath(pathTrailComponents),
        absolutePath: asAbsolutePath(pathTrailComponents)
    }
}
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

export function normalizePath(pathComponents) {
  return '/' + pathComponents.map(x => x.isParameter ? '{}' : x.name).join('/')
}

export function toAbsolutePath(pathComponents) {
  return '/' + pathComponents.map(x => x.isParameter ? `{${x.name}}` : x.name).join('/')
}

function lastOrElse(array, defaultValue) {
  const length = array.length;
  return length === 0 ? defaultValue : array[length - 1]
}

const rootPathComponent = [];
export function prefixes(pathComponents) {
  return pathComponents
    .reduce((acc, pathComponent) => {
      return [
        ...acc,
        [...(lastOrElse(acc, [])), pathComponent]
      ]
    }, [rootPathComponent])
}

export function resolvePath(pathComponents, pathsById) {
  const normalizedPathMap = Object.entries(pathsById)
    .reduce((acc, [pathId, pathComponent]) => {
      const normalizedAbsolutePath = asNormalizedAbsolutePath(asPathTrailComponents(pathId, pathsById))
      acc[normalizedAbsolutePath] = pathComponent
      return acc
    }, {})
  const pathPrefixes = prefixes(pathComponents).reverse()
  // should be guaranteed to have a match of at least [] => '/' (root)
  const lastMatchComponents = pathPrefixes
    .find((pathComponentPrefix) => {
      const normalized = normalizePath(pathComponentPrefix)
      const match = normalizedPathMap[normalized]
      return !!match
    })


  const normalized = normalizePath(lastMatchComponents)
  const lastMatch = normalizedPathMap[normalized]

  const lengthDifference = pathComponents.length - lastMatchComponents.length;
  const toAdd = lengthDifference <= 0 ? [] : pathComponents.slice(-1 * lengthDifference)
  return {
    lastMatch,
    toAdd
  }
}

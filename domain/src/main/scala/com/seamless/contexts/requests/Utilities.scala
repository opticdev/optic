package com.seamless.contexts.requests

object Utilities {

  def prefixes(path: String): Vector[String] = {
    path
      .split("/")
      .tail
      .foldLeft(Vector.empty[String])((prefixes: Vector[String], pathComponent: String) => {
        prefixes :+ (if (prefixes.isEmpty) "" else prefixes.last) + "/" + pathComponent
      })
  }

  case class PathComponentInfo(absolutePath: String, name: String, pathId: String, parentPathId: String)

  def oasPathsToPathComponentInfoSeq(oasPaths: Vector[String], idGenerator: Iterator[String]): Seq[PathComponentInfo] = {
    val sanitizedPaths = oasPaths
      .sorted
      .map(oasPath => {
        oasPath
          .split("/")
          .tail
          .map(pathComponent => {
            if (pathComponent.startsWith("{")) "{}" else pathComponent
          })
          .fold("")(_ + "/" + _)
      })

    // mapping from sanitized paths to original paths
    val pathMap = sanitizedPaths.zip(oasPaths.sorted).toMap

    // put each component in order
    val sortedComponents = sanitizedPaths
      .flatMap(prefixes)
      .toSet.toArray.sorted
    // assign each component an id
    val idMap = sortedComponents.map(p => (p, idGenerator.next())).toMap

    sortedComponents
      .map(p => {
        val pathComponents = p.split("/").tail
        val parentPath = pathComponents.init.fold("")(_ + "/" + _)
        val parentId = idMap.getOrElse(parentPath, "root")
        val originalPath = pathMap.getOrElse(p, p)
        val originalPathComponents = originalPath.split("/")
        val id = idMap.getOrElse(p, "BAD")

        PathComponentInfo(originalPath, originalPathComponents.last, id, parentId)
      })
  }
}

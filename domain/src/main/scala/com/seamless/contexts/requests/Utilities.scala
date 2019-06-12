package com.seamless.contexts.requests

import com.seamless.contexts.requests.Commands.{rootPathId}

object Utilities {

  def prefixes(path: String): Vector[String] = {
    path
      .split("/")
      .tail
      .foldLeft(Vector.empty[String])((prefixes: Vector[String], pathComponent: String) => {
        prefixes :+ (if (prefixes.isEmpty) "" else prefixes.last) + "/" + pathComponent
      })
  }

  private val pathParameterRegex = "^\\{(.*)\\}$".r

  case class PathComponentInfo(absolutePath: String, name: String, pathId: String, parentPathId: String) {
    def isPathParameter: Boolean = name.matches(pathParameterRegex.pattern.toString)
    def pathParameterName: String = name match { case pathParameterRegex(givenName) => givenName }
  }

  def isRootPath(string: String) = string.trim == "/"

  def oasPathsToPathComponentInfoSeq(oasPaths: Vector[String], idGenerator: Iterator[String]): Seq[PathComponentInfo] = {

    val pathsSample = oasPaths.filterNot(isRootPath)

    val sanitizedPaths = pathsSample
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
    val pathMap = sanitizedPaths.zip(pathsSample.sorted).toMap

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
        val parentId = idMap.getOrElse(parentPath, rootPathId)
        val originalPath = pathMap.getOrElse(p, p)
        val originalPathComponents = originalPath.split("/")
        val id = idMap.getOrElse(p, "BAD")

        PathComponentInfo(originalPath, originalPathComponents.last, id, parentId)
      })
  }
}

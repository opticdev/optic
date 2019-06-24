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

  case class PathComponentInfo(originalPaths: Vector[String], name: String, pathId: String, parentPathId: String) {
    def isPathParameter: Boolean = name.matches(pathParameterRegex.pattern.toString)

    def pathParameterName: String = name match {
      case pathParameterRegex(givenName) => givenName
    }
  }

  def isRootPath(string: String) = string.trim == "/"

  def oasPathsToPathComponentInfoSeq(oasPaths: Vector[String], idGenerator: Iterator[String]): Seq[PathComponentInfo] = {

    val pathsSample = oasPaths.filterNot(isRootPath)
    val normalizedPathToComponentName = pathsSample
      .flatMap(prefixes).toSet
      .map((prefix: String) => {
        val split = prefix.split("/")
        val normalized = split.tail
          .map(pathComponent => {
            if (pathComponent.startsWith("{")) "{}" else pathComponent
          })
          .fold("")(_ + "/" + _)
        (normalized -> split.last)
      }).toMap

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

    val mappedToOriginal: Map[String, Vector[String]] = sanitizedPaths.zip(pathsSample.sorted).groupBy(_._1).mapValues(_.map(_._2))

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
        val id = idMap(p)
        val name = normalizedPathToComponentName(p)

        PathComponentInfo(mappedToOriginal.getOrElse(p, Vector.empty), name, id, parentId)
      })
  }
}

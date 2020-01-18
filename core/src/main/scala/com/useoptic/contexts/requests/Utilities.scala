package com.useoptic.contexts.requests

import com.useoptic.contexts.requests.Commands._

import scala.scalajs.js.annotation.{JSExport, JSExportAll}

@JSExport
@JSExportAll
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

  def toAbsolutePath(pathId: PathComponentId)(implicit pathComponents: Map[PathComponentId, PathComponent]): String = {
    if (pathId == rootPathId) {
      "/"
    } else {
      val pathComponent = pathComponents(pathId)
      val (parentAbsolutePath, name) = pathComponent.descriptor match {
        case p: BasicPathComponentDescriptor => {
          (toAbsolutePath(p.parentPathId), p.name)
        }
        case p: ParameterizedPathComponentDescriptor => {
          (toAbsolutePath(p.parentPathId), s":${p.name}")
        }
      }
      if (parentAbsolutePath == "/") {
        "/" + name
      } else {
        parentAbsolutePath + "/" + name
      }
    }
  }

  type PathMap = Map[PathComponentId, PathComponent]
  def resolvePath(url: String, pathMap: PathMap): Option[PathComponentId] = {
    val children = pathMap.toSeq
      .groupBy((entry) => {
        val (_, pathComponent) = entry
        pathComponent.descriptor.parentPathId
      })
    val urlComponents = url.split("/").filterNot(_ == "")
    if (urlComponents.isEmpty) {
      Some(rootPathId)
    } else {
      val lastParent = rootPathId
      resolveHelper(lastParent, urlComponents, children)
    }
  }

  def resolveHelper(lastParent: PathComponentId, urlComponents: Seq[String], children: Map[PathComponentId, Seq[(String, PathComponent)]]): Option[PathComponentId] = {
    if (urlComponents.isEmpty) {
      Some(lastParent)
    } else {
      val component = urlComponents.head
      children.get(lastParent) match {
        case Some(pathComponents) => {
          //@GOTCHA: might need to group/sort pathComponents to prioritize BasicPathComponentDescriptors
          val sortedPathComponents = pathComponents.sortBy((item) => {
            val (_, p) = item

            p.descriptor match {
              case d: BasicPathComponentDescriptor => 0
              case d: ParameterizedPathComponentDescriptor => 1
            }
          })
          val matchingComponent = sortedPathComponents.find(p => p._2.descriptor match {
            case d: BasicPathComponentDescriptor => {
              d.name == component
            }
            case d: ParameterizedPathComponentDescriptor => {
              true
            }
          })
          matchingComponent match {
            case Some(p) => {
              val remainingComponents = urlComponents.tail
              resolveHelper(p._1, remainingComponents, children)
            }
            case None => {
              None
            }
          }
        }
        case None => {
          None
        }
      }
    }
  }
}

package com.seamless.oas.export

import com.seamless.contexts.requests.Commands.PathComponentId
import com.seamless.contexts.requests.Events.{PathComponentAdded, PathComponentRemoved, PathComponentRenamed, PathParameterAdded, PathParameterRemoved}
import com.seamless.contexts.rfc.Events.RfcEvent
import com.seamless.ddd.Projection

case class FullPath(pathId: PathComponentId, isParameter: Boolean, _parentPathIds: Vector[PathComponentId], name: String, absolutePath: String, normalizedAbsolutePath: String)

object PathListProjection extends Projection[RfcEvent, Vector[FullPath]] {

  override def fromEvents(events: Vector[RfcEvent]): Vector[FullPath] = {
    val pathMap: Map[PathComponentId, FullPath] = Map("root" -> FullPath("root", isParameter = false,Vector.empty, "", "/", "/"))
    withMap(pathMap, events)
  }

  override def withInitialState(initialState: Vector[FullPath], events: Vector[RfcEvent]): Vector[FullPath] = {
    val pathMap = initialState.map(item => item.pathId -> item).toMap
    withMap(pathMap, events)
  }

  def joinPath(parentPath: String, pathComponent: String)  = {
    if (parentPath == "/") parentPath + pathComponent else parentPath + "/" + pathComponent
  }

  def withMap(pathMap: Map[PathComponentId, FullPath], events: Vector[RfcEvent]): Vector[FullPath] = {
    val results = events.foldLeft(pathMap)((acc, e) => {
      e match {
        case PathComponentAdded(pathId, parentPathId, name) => {
          val parent = acc(parentPathId)
          acc + (pathId -> FullPath(pathId, isParameter = false, parentPathId +: parent._parentPathIds, name, joinPath(parent.absolutePath, name), joinPath(parent.normalizedAbsolutePath, name)))
        }
        case PathComponentRenamed(pathId, name) => {
          val p = acc(pathId)
          acc.updated(pathId, p.copy(name = name))
        }

        case PathComponentRemoved(pathId) => {
          acc - pathId
        }

        case PathParameterAdded(pathId, parentPathId, name) => {
          val parent = acc(parentPathId)
          acc + (pathId -> FullPath(pathId, isParameter = true, parentPathId +: parent._parentPathIds, name, joinPath(parent.absolutePath, "{" + name + "}"), joinPath(parent.normalizedAbsolutePath, "{" + name + "}")))
        }

        case PathParameterRemoved(pathId) => {
          acc - pathId
        }

        case _ => acc
      }
    })

    results.values.toVector
  }
}

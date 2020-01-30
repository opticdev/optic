package com.useoptic.contexts.rfc.projections

import com.useoptic.contexts.requests.Commands.PathComponentId
import com.useoptic.contexts.requests.Events.{PathComponentAdded, PathComponentRemoved, PathComponentRenamed, PathParameterAdded, PathParameterRemoved}
import com.useoptic.contexts.rfc.Events.RfcEvent
import com.useoptic.ddd.Projection

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
    val results = events.foldLeft(pathMap)((acc, event) => {
      event match {
        case e: PathComponentAdded => {
          val parent = acc(e.parentPathId)
          acc + (e.pathId -> FullPath(e.pathId, isParameter = false, e.parentPathId +: parent._parentPathIds, e.name, joinPath(parent.absolutePath, e.name), joinPath(parent.normalizedAbsolutePath, e.name)))
        }
        case e: PathComponentRenamed => {
          val p = acc(e.pathId)
          acc.updated(e.pathId, p.copy(name = e.name))
        }

        case e: PathComponentRemoved => {
          acc - e.pathId
        }

        case e: PathParameterAdded => {
          val parent = acc(e.parentPathId)
          acc + (e.pathId -> FullPath(e.pathId, isParameter = true, e.parentPathId +: parent._parentPathIds, e.name, joinPath(parent.absolutePath, "{" + e.name + "}"), joinPath(parent.normalizedAbsolutePath, "{" + e.name + "}")))
        }

        case e: PathParameterRemoved => {
          acc - e.pathId
        }

        case _ => acc
      }
    })

    results.values.toVector
  }
}

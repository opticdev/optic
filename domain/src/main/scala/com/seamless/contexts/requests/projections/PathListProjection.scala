package com.seamless.contexts.requests.projections

import com.seamless.contexts.requests.Commands.PathComponentId
import com.seamless.contexts.requests.Events.{PathComponentAdded, PathComponentRemoved, PathComponentRenamed, PathParameterAdded, PathParameterRemoved}
import com.seamless.contexts.rfc.Events.RfcEvent
import com.seamless.ddd.Projection

import scala.scalajs.js.annotation.{JSExport, JSExportAll}

@JSExportAll
case class Path(pathId: PathComponentId, parentPathIds: Vector[PathComponentId], name: String, absolutePath: String, normalizedAbsolutePath: String)

@JSExport
@JSExportAll
object PathListProjection extends Projection[RfcEvent, Vector[Path]] {

  override def fromEvents(events: Vector[RfcEvent]): Vector[Path] = {
    val pathMap: Map[PathComponentId, Path] = Map("root" -> Path("root", Vector.empty, "", "/", "/"))
    withMap(pathMap, events)
  }

  override def withInitialState(initialState: Vector[Path], events: Vector[RfcEvent]): Vector[Path] = {
    val pathMap = initialState.map(item => item.pathId -> item).toMap
    withMap(pathMap, events)
  }

  def joinPath(parentPath: String, pathComponent: String)  = {
    if (parentPath == "/") parentPath + pathComponent else parentPath + "/" + pathComponent
  }

  def withMap(pathMap: Map[PathComponentId, Path], events: Vector[RfcEvent]): Vector[Path] = {
    val results = events.foldLeft(pathMap)((acc, e) => {
      e match {
        case PathComponentAdded(pathId, parentPathId, name) => {
          val parent = acc(parentPathId)
          acc + (pathId -> Path(pathId, parentPathId +: parent.parentPathIds, name, joinPath(parent.absolutePath, name), joinPath(parent.normalizedAbsolutePath, name)))
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
          acc + (pathId -> Path(pathId, parentPathId +: parent.parentPathIds, name, joinPath(parent.absolutePath, "{" + name + "}"), joinPath(parent.normalizedAbsolutePath, "{" + name + "}")))
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

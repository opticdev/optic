package com.seamless.contexts.requests.projections

import com.seamless.contexts.requests.Commands.PathComponentId
import com.seamless.contexts.requests.Events.{PathComponentAdded, PathComponentRemoved, PathComponentRenamed, PathParameterAdded, PathParameterRemoved}
import com.seamless.contexts.rfc.Events.RfcEvent
import com.seamless.ddd.Projection

import scala.scalajs.js.annotation.{JSExport, JSExportAll}

@JSExportAll
case class Path(pathId: PathComponentId, parentPathId: PathComponentId, name: String, absolutePath: String)

@JSExport
@JSExportAll
object PathListProjection extends Projection[RfcEvent, Vector[Path]] {

  override def fromEvents(events: Vector[RfcEvent]): Vector[Path] = {
    val pathMap: Map[PathComponentId, Path] = Map.empty
    withMap(pathMap, events)
  }

  override def withInitialState(initialState: Vector[Path], events: Vector[RfcEvent]): Vector[Path] = {
    val pathMap = initialState.map(item => item.pathId -> item).toMap
    withMap(pathMap, events)
  }

  def withMap(pathMap: Map[PathComponentId, Path], events: Vector[RfcEvent]): Vector[Path] = {
    val results = events.foldLeft(pathMap)((acc, e) => {
      e match {
        case PathComponentAdded(pathId, parentPathId, name) => {
          val parentName = acc.get(parentPathId) match {
            case Some(p) => p.absolutePath
            case None => ""
          }
          acc + (pathId -> Path(pathId, parentPathId, name, parentName + "/" + name))
        }
        case PathComponentRenamed(pathId, name) => {
          val p = acc(pathId)
          acc.updated(pathId, p.copy(name = name))
        }

        case PathComponentRemoved(pathId) => {
          acc - pathId
        }

        case PathParameterAdded(pathId, parentPathId, name) => {
          val parentName = acc.get(parentPathId) match {
            case Some(p) => p.absolutePath
            case None => ""
          }

          acc + (pathId -> Path(pathId, parentPathId, name, parentName + "/" + "{" + name + "}"))
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

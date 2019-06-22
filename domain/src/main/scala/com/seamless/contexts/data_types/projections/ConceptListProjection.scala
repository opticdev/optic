package com.seamless.contexts.data_types.projections

import com.seamless.contexts.data_types.Commands.ConceptId
import com.seamless.contexts.data_types.Events.{ConceptDefined, ConceptDeprecated, ConceptNamed}
import com.seamless.contexts.rfc.Events.RfcEvent
import com.seamless.ddd.Projection

import scala.scalajs.js.annotation.JSExportAll

@JSExportAll
case class NamedConcept(name: String, deprecated: Boolean, id: String)

object ConceptListProjection  extends Projection[RfcEvent, Vector[NamedConcept]] {
  override def fromEvents(events: Vector[RfcEvent]): Vector[NamedConcept] = {
    val conceptMap: Map[ConceptId, NamedConcept] = Map.empty
    withMap(conceptMap, events)
  }

  override def withInitialState(initialState: Vector[NamedConcept], events: Vector[RfcEvent]): Vector[NamedConcept] = {
    val conceptMap = initialState.map(item => item.id -> item).toMap
    withMap(conceptMap, events)
  }

  def withMap(pathMap: Map[ConceptId, NamedConcept], events: Vector[RfcEvent]): Vector[NamedConcept] = {
    val results = events.foldLeft(pathMap)((acc, e) => {
      e match {
        case ConceptDefined(name, root, id) => {
          acc + (id -> NamedConcept(name, deprecated = false, id))
        }
        case ConceptNamed(name, id) => {
          acc + (id -> acc(id).copy(name = name))
        }
        case ConceptDeprecated(id) => {
          acc + (id -> acc(id).copy(deprecated = true))
        }
        case _ => acc
      }
    })

    results.values.toVector
  }
}
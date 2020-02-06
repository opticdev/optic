package com.useoptic.contexts.rfc.projections

import com.useoptic.contexts.rfc.Events.{ContributionAdded, RfcEvent}
import com.useoptic.ddd.Projection

object ContributionsProjection extends Projection[RfcEvent, Map[String, Map[String, String]]] {

  override def fromEvents(events: Vector[RfcEvent]): Map[String, Map[String, String]] = {
    withMap(Map.empty, events)
  }

  override def withInitialState(initialState: Map[String, Map[String, String]], events: Vector[RfcEvent]): Map[String, Map[String, String]] = {
    withMap(initialState, events)
  }

  def withMap(contributionMap: Map[String, Map[String, String]], events: Vector[RfcEvent]): Map[String, Map[String, String]] = {

    def toMutable[A](m: Map[String, A]) = scala.collection.mutable.HashMap[String, A](m.toVector: _*)

    val mutableMap = toMutable(contributionMap.mapValues(toMutable))

    val results = events.foreach {
      case e: ContributionAdded => {
        val contributionsForId = mutableMap.getOrElseUpdate(e.id, toMutable(Map.empty[String, String]))
        contributionsForId.put(e.key, e.value)
        mutableMap
      }
      case _ =>
    }

    mutableMap.mapValues(_.toMap).toMap
  }
}

package com.seamless.contexts.rfc.projections

import com.seamless.contexts.requests.Commands.PathComponentId
import com.seamless.contexts.requests.Events.{PathComponentAdded, PathComponentRemoved, PathComponentRenamed, PathParameterAdded, PathParameterRemoved}
import com.seamless.contexts.rfc.Events.{ContributionAdded, RfcEvent}
import com.seamless.ddd.Projection

import scala.scalajs.js.Dictionary
import scala.scalajs.js.annotation.{JSExport, JSExportAll}

@JSExport
@JSExportAll
case class ContributionWrapper(all: Map[String, Map[String, String]]) {
  import scala.scalajs.js
  def getOrUndefined(id: String, key: String): js.UndefOr[String] = {
    import js.JSConverters._
    all.get(id).flatMap(_.get(key)).orUndefined
  }

  def asJsDictionary: Dictionary[Dictionary[String]] = {
    import js.JSConverters._
    all.mapValues(_.toJSDictionary).toJSDictionary
  }
}

object ContributionsProjection extends Projection[RfcEvent, ContributionWrapper] {

  override def fromEvents(events: Vector[RfcEvent]): ContributionWrapper = {
    withMap(Map.empty, events)
  }

  override def withInitialState(initialState: ContributionWrapper, events: Vector[RfcEvent]): ContributionWrapper = {
    withMap(initialState.all, events)
  }

  def withMap(contributionMap: Map[String, Map[String, String]], events: Vector[RfcEvent]): ContributionWrapper = {

    def toMutable[A](m: Map[String, A]) = scala.collection.mutable.HashMap[String, A](m.toVector: _*)

    val mutableMap = toMutable(contributionMap.mapValues(toMutable))

    val results = events.foreach {
      case ContributionAdded(id, key, value) => {
        val contributionsForId = mutableMap.getOrElseUpdate(id, toMutable(Map.empty[String, String]))
        contributionsForId.put(key, value)
        mutableMap
      }
      case _ =>
    }

    ContributionWrapper(mutableMap.mapValues(_.toMap).toMap)
  }
}

package com.seamless.ddd.projections

import com.seamless.contexts.shapes.Commands.{DynamicParameterList, ShapeId}
import com.seamless.contexts.shapes.Events.{ShapeAdded, ShapeRenamed}
import com.seamless.contexts.rfc.Events.RfcEvent
import org.scalatest.FunSpec

class ProjectionLogicSpec extends FunSpec {

  case class InternalS(count: Int) extends InternalProjectionState

  it("can support a projection with no dependencies") {

    val eventCounterProjection = new ProjectionLogic[RfcEvent, InternalS] {
      override def applyEvent(event: RfcEvent, state: InternalS): InternalS = {
        state.copy(count = state.count + 1)
      }

      override def initialState: InternalS = InternalS(0)
    }

    val state = eventCounterProjection.applyEvents(Vector(
      ShapeAdded("a", "a", DynamicParameterList(Seq.empty), "a"),
      ShapeAdded("b", "b", DynamicParameterList(Seq.empty), "b"),
      ShapeAdded("c", "c", DynamicParameterList(Seq.empty), "c"),
    ))

    assert(state.count == 3)
  }

  it("can support a projection with dependencies ") {

    case class ConceptNames(names: Map[ShapeId, String]) extends InternalProjectionState

    val AllConceptNamesProjection = new ProjectionLogic[RfcEvent, ConceptNames] {
      override def applyEvent(event: RfcEvent, state: ConceptNames): ConceptNames = {
        event match {
          case e: ShapeAdded => {
            state.copy(names = state.names + (e.shapeId -> e.name))
          }
          case e: ShapeRenamed => {
            state.copy(names = state.names + (e.shapeId -> e.name))
          }
          case _ => state
        }
      }

      override def initialState: ConceptNames = ConceptNames(Map())
    }


    case class ConceptsWithSpaces(names: Seq[String], ids: Seq[String]) extends InternalProjectionState

    val ConceptsWithSpacesInName = new ProjectionLogic[RfcEvent, ConceptsWithSpaces] {
      override def applyEvent(event: RfcEvent, state: ConceptsWithSpaces): ConceptsWithSpaces = {
        applyEventToDependencies(event, state)

        val conceptNames = state.stateOf("concept-names").asInstanceOf[ConceptNames]

        val withSpaces = conceptNames.names.filter(_._2.contains(" "))

        ConceptsWithSpaces(withSpaces.toVector.map(_._2), withSpaces.toVector.map(_._1))
          .includeDependentStates(state)
      }

      override def initialState: ConceptsWithSpaces = ConceptsWithSpaces(Seq(), Seq())

      dependsOn("concept-names", AllConceptNamesProjection)
    }

    val state = ConceptsWithSpacesInName.applyEvents(Vector(
      ShapeAdded("a", "a", DynamicParameterList(Seq.empty), "Hello World"),
      ShapeAdded("b", "b", DynamicParameterList(Seq.empty), "DoingCode"),
      ShapeAdded("c", "c", DynamicParameterList(Seq.empty), "Our Teams"),
    ))

    assert(state == ConceptsWithSpaces(Vector("Hello World", "Our Teams"), Vector("a", "c")))
  }

}

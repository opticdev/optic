package com.seamless.ddd.projections

import com.seamless.contexts.data_types.Commands.ConceptId
import com.seamless.contexts.data_types.Events.{ConceptDefined, ConceptNamed}
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
      ConceptDefined("a", "a", "a"),
      ConceptDefined("b", "b", "b"),
      ConceptDefined("c", "c", "c"),
    ))

    assert(state.count == 3)
  }

  it("can support a projection with dependencies ") {

    case class ConceptNames(names: Map[ConceptId, String]) extends InternalProjectionState

    val AllConceptNamesProjection = new ProjectionLogic[RfcEvent, ConceptNames] {
      override def applyEvent(event: RfcEvent, state: ConceptNames): ConceptNames = {
        event match {
          case ConceptDefined(name, root, conceptId) => {
            state.copy(names = state.names + (conceptId -> name))
          }
          case ConceptNamed(newName, conceptId) => {
            state.copy(names = state.names + (conceptId -> newName))
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
      ConceptDefined("Hello World", "a", "a"),
      ConceptDefined("DoingCode", "b", "b"),
      ConceptDefined("Our Teams", "c", "c"),
    ))

    assert(state == ConceptsWithSpaces(Vector("Hello World", "Our Teams"), Vector("a", "c")))
  }

}

package com.seamless.contexts.rfc

import com.seamless.contexts.rfc.projections.OASProjection
import com.seamless.contexts.shapes.ShapesState
import com.seamless.contexts.shapes.projections.{FlatShapeProjection, JsonSchemaProjection}
import com.seamless.diff.JsonFileFixture
import com.seamless.diff.initial.ShapeBuilder
import org.scalatest.FunSpec

class OASProjectionSpec extends FunSpec with JsonFileFixture {
  val commandContext: RfcCommandContext = RfcCommandContext("a", "b", "c")

  def fixture(slug: String): (InMemoryQueries, RfcService, RfcState) = {

    val eventStore = RfcServiceJSFacade.makeEventStore()
    eventStore.append("id", eventsFrom(slug))
    val rfcService: RfcService = new RfcService(eventStore)

    (new InMemoryQueries(eventStore, rfcService, "id"), rfcService, rfcService.currentState("id"))
  }

  it("works for basic todo app") {
    val (queries, rfcService, rfcState) = fixture("todo")
    val oas = new OASProjection(queries, rfcService, "id")
    println(oas.generate)
  }

  it("works for basic dry todo app") {
    val (queries, rfcService, rfcState) = fixture("todo-dry")
    val oas = new OASProjection(queries, rfcService, "id")
    println(oas.generate)
  }



  describe("Json Schema") {

    it("works for todo shape") {
      val (queries, rfcService, rfcState) = fixture("todo")
      val todoSchema = new JsonSchemaProjection("jghsd0_1")(rfcState.shapesState).asJsonSchema(expand = false)

      println(todoSchema)
    }

  }
}


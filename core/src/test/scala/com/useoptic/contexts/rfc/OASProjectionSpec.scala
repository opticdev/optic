package com.useoptic.contexts.rfc

import com.useoptic.contexts.rfc.projections.OASProjection
import com.useoptic.contexts.shapes.projections.{JsonSchemaProjection}
import com.useoptic.diff.JsonFileFixture
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
    assert(oas.generate.noSpaces == "{\"openapi\":\"3.0.1\",\"info\":{\"title\":\"ToDo\",\"version\":\"68\"},\"paths\":{\"/todos\":{\"get\":{\"operationId\":\"request_H4N9eE2ueT\",\"responses\":{\"200\":{\"content\":{\"application/json; charset=utf-8\":{\"schema\":{\"type\":\"array\",\"items\":{\"type\":\"object\",\"required\":[\"id\",\"isDone\",\"task\"],\"properties\":{\"dueDate\":{\"type\":\"string\"},\"id\":{\"type\":\"string\"},\"isDone\":{\"type\":\"boolean\"},\"task\":{\"type\":\"string\"}}}}}},\"description\":\"\"}}},\"post\":{\"operationId\":\"request_jSdvEiRo9a\",\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"type\":\"object\",\"required\":[\"isDone\",\"task\"],\"properties\":{\"isDone\":{\"type\":\"boolean\"},\"task\":{\"type\":\"string\"}}}}}},\"responses\":{\"200\":{\"content\":{\"application/json; charset=utf-8\":{\"schema\":{\"type\":\"object\",\"required\":[\"id\",\"isDone\",\"task\"],\"properties\":{\"id\":{\"type\":\"string\"},\"isDone\":{\"type\":\"boolean\"},\"task\":{\"type\":\"string\"}}}}},\"description\":\"\"}}},\"parameters\":[]},\"/todos/{todoId}\":{\"patch\":{\"operationId\":\"request_Pa77UBarCD\",\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"type\":\"object\",\"required\":[\"isDone\",\"task\"],\"properties\":{\"isDone\":{\"type\":\"boolean\"},\"task\":{\"type\":\"string\"}}}}}},\"responses\":{\"200\":{\"content\":{\"application/json; charset=utf-8\":{\"schema\":{\"type\":\"object\",\"required\":[\"dueDate\",\"id\",\"isDone\",\"task\"],\"properties\":{\"dueDate\":{\"type\":\"string\"},\"id\":{\"type\":\"string\"},\"isDone\":{\"type\":\"boolean\"},\"task\":{\"type\":\"string\"}}}}},\"description\":\"\"}}},\"parameters\":[{\"in\":\"path\",\"name\":\"todoId\",\"required\":true,\"schema\":{\"type\":\"string\"}}]}},\"components\":{\"schemas\":{}}}")
  }

  it("works for basic dry todo app") {
    val (queries, rfcService, rfcState) = fixture("todo-dry")
    val oas = new OASProjection(queries, rfcService, "id")
    assert(oas.generate.noSpaces == "{\"openapi\":\"3.0.1\",\"info\":{\"title\":\"Unnamed API\",\"version\":\"51\"},\"paths\":{\"/todos\":{\"get\":{\"operationId\":\"request_CRRIXlDlNB\",\"responses\":{\"200\":{\"content\":{\"application/json; charset=utf-8\":{\"schema\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/ToDo\"}}}},\"description\":\"\"}}},\"post\":{\"operationId\":\"request_6yVKPpNNau\",\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"type\":\"object\",\"required\":[\"isDone\",\"task\"],\"properties\":{\"isDone\":{\"type\":\"boolean\"},\"task\":{\"type\":\"string\"}}}}}},\"responses\":{\"200\":{\"content\":{\"application/json; charset=utf-8\":{\"schema\":{\"$ref\":\"#/components/schemas/ToDo\"}}},\"description\":\"\"}}},\"parameters\":[]},\"/todos/{todoId}\":{\"patch\":{\"operationId\":\"request_uKHqw2t5H7\",\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"type\":\"object\",\"required\":[\"isDone\",\"task\"],\"properties\":{\"isDone\":{\"type\":\"boolean\"},\"task\":{\"type\":\"string\"}}}}}},\"responses\":{\"200\":{\"content\":{\"application/json; charset=utf-8\":{\"schema\":{\"$ref\":\"#/components/schemas/ToDo\"}}},\"description\":\"\"}}},\"parameters\":[{\"in\":\"path\",\"name\":\"todoId\",\"required\":true,\"schema\":{\"type\":\"string\"}}]}},\"components\":{\"schemas\":{\"ToDo\":{\"type\":\"object\",\"required\":[\"id\",\"isDone\",\"task\"],\"properties\":{\"dueDate\":{\"type\":\"string\"},\"id\":{\"type\":\"string\"},\"isDone\":{\"type\":\"boolean\"},\"task\":{\"type\":\"string\"}}}}}}")
  }

  describe("Json Schema") {

    it("works for todo shape") {
      val (queries, rfcService, rfcState) = fixture("todo")
      val todoSchema = new JsonSchemaProjection("jghsd0_1")(rfcState.shapesState).asJsonSchema(expand = false)
      assert(todoSchema.noSpaces == "{\"type\":\"object\",\"required\":[\"id\",\"isDone\",\"task\"],\"properties\":{\"dueDate\":{\"type\":\"string\"},\"id\":{\"type\":\"string\"},\"isDone\":{\"type\":\"boolean\"},\"task\":{\"type\":\"string\"}}}")
    }

  }
}


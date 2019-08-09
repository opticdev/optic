package com.seamless.oas.export

import com.seamless.contexts.rfc.Events.RfcEvent
import com.seamless.contexts.rfc.{InMemoryQueries, RfcService}
import com.seamless.ddd.{EventStore, InMemoryEventStore}
import org.scalatest.FunSpec
import io.circe._, io.circe.parser._

class OASExportSpec extends FunSpec {

  def loadRfcServiceFromEvents(file: String) = new {
    val eventStore = new InMemoryEventStore[RfcEvent]()
    val service = {
      val loaded = scala.io.Source.fromFile(file)
      val source = loaded.getLines mkString "\n"
      loaded.close()
      eventStore.bulkAdd("id", source)
      new RfcService(eventStore)
    }
    val queries = new InMemoryQueries(eventStore, service, "id")
  }

  lazy val a = loadRfcServiceFromEvents("src/test/scala/com/seamless/oas/export/github-events.json")
  lazy val p = loadRfcServiceFromEvents("src/test/scala/com/seamless/oas/export/pagination.json")


  it("can export example as OAS") {
    val exporter = new OASExport(a.queries, a.service)
//    println(exporter.fullOASDescription)
  }

  it("can export example as OAS with complex features") {
    val exporter = new OASExport(p.queries, p.service)
//    println(exporter.fullOASDescription)
  }

  it("can create a json schema from a simple shape") {
    val jsonSchemaBuilder = new JsonSchemaBuilder(a.queries.shapesState, a.queries.namedShapes)
    assert(
      jsonSchemaBuilder.fromShapeId("concept_438_blob").asJson ==
        parse(
          """
            |{
            |  "type" : "object",
            |  "properties" : {
            |    "content" : {
            |      "type" : "string"
            |    },
            |    "encoding" : {
            |      "type" : {
            |
            |      }
            |    },
            |    "sha" : {
            |      "type" : "string"
            |    },
            |    "size" : {
            |      "type" : "number"
            |    }
            |  }
            |}
          """.stripMargin).right.get
    )
  }


  it("can create a json schema with a list of type ref") {
    val jsonSchemaBuilder = new JsonSchemaBuilder(a.queries.shapesState, a.queries.namedShapes)
    assert(
      jsonSchemaBuilder.fromShapeId("concept_352_trees").asJson ==
        parse(
          """
            |{
            |  "type" : "object",
            |  "properties" : {
            |    "base_tree" : {
            |      "type" : "string"
            |    },
            |    "sha" : {
            |      "type" : "string"
            |    },
            |    "tree" : {
            |      "type" : "array",
            |      "items" : {
            |        "$ref" : "#/components/schemas/tree"
            |      }
            |    },
            |    "url" : {
            |      "type" : "string"
            |    }
            |  }
            |}
          """.stripMargin).right.get
    )
  }

  it("can create a json schema with $identifer") {
    val jsonSchemaBuilder = new JsonSchemaBuilder(p.queries.shapesState, p.queries.namedShapes)
    assert(jsonSchemaBuilder.fromShapeId("shape_tUBNMqrbH8").asJson ==
    parse(
      """
        |{
        |  "type" : "object",
        |  "properties" : {
        |    "name" : {
        |      "type" : "string"
        |    },
        |    "pets" : {
        |      "type" : "array",
        |      "items" : {
        |        "$ref" : "#/components/schemas/PetId"
        |      }
        |    },
        |    "id" : {
        |      "type" : "string",
        |      "description" : "An identifier represented as a \"string\""
        |    }
        |  }
        |}
      """.stripMargin).right.get)
  }

  it("can create a json schema with $reference") {
    val jsonSchemaBuilder = new JsonSchemaBuilder(p.queries.shapesState, p.queries.namedShapes)
    assert(jsonSchemaBuilder.fromShapeId("shape_qTpcQSuB5x").asJson ==
    parse(
      """
        |{
        |  "type" : "string",
        |  "description" : "A reference to an entity of Pet"
        |}
      """.stripMargin).right.get)
  }

  it("can handle an $identifier at the root") {
    val jsonSchemaBuilder = new JsonSchemaBuilder(p.queries.shapesState, p.queries.namedShapes)
    assert(jsonSchemaBuilder.fromShapeId("shape_dY7mlARAzR").asJson ==
    parse(
      """
        |{
        |  "type" : "string",
        |  "description" : "An identifier represented as a \"string\""
        |}
      """.stripMargin).right.get)
  }

  it("can handle an normal reference at the root") {
    val jsonSchemaBuilder = new JsonSchemaBuilder(p.queries.shapesState, p.queries.namedShapes)
    assert(jsonSchemaBuilder.fromShapeId("shape_xjFPHStBl6").asJson ==
    parse(
      """
        |{
        |  "$ref" : "#/components/schemas/PetList"
        |}
      """.stripMargin).right.get)
  }

  it("can handle an normal reference at the root in") {
    val jsonSchemaBuilder = new JsonSchemaBuilder(a.queries.shapesState, a.queries.namedShapes)
    assert(jsonSchemaBuilder.fromShapeId("concept_351_users").asJson ==
      parse(
        """
          |{
          |  "type" : "array",
          |  "items" : {
          |    "$ref" : "#/components/schemas/user"
          |  }
          |}
        """.stripMargin).right.get)
  }

  it("can create a json schema from a generic usage") {
    val jsonSchemaBuilder = new JsonSchemaBuilder(p.queries.shapesState, p.queries.namedShapes)
    assert(jsonSchemaBuilder.fromShapeId("shape_YPyuORdmZ7").asJson ==
      parse(
        """
          |{
          |  "allOf" : [
          |    {
          |      "$ref" : "#/components/schemas/PaginatedList"
          |    },
          |    {
          |      "type" : "object",
          |      "properties" : {
          |        "items" : {
          |          "type" : "array",
          |          "items" : {
          |            "$ref" : "#/components/schemas/Owner"
          |          }
          |        }
          |      }
          |    }
          |  ]
          |}
        """.stripMargin).right.get
    )
  }

}

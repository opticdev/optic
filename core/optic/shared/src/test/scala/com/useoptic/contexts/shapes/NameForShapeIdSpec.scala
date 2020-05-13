package com.useoptic.contexts.shapes

import com.useoptic.contexts.rfc.{RfcCommandContext, RfcService, RfcServiceJSFacade}
import com.useoptic.contexts.shapes.Commands.{AddShape, FieldShapeFromShape}
import com.useoptic.contexts.shapes.projections.{FlatShapeProjection, NameForShapeId}
import com.useoptic.diff._
import com.useoptic.diff.initial.ShapeBuilder
import com.useoptic.types.capture.JsonLikeFrom
import org.scalatest.FunSpec

class NameForShapeIdSpec extends FunSpec with JsonFileFixture {
  val commandContext: RfcCommandContext = RfcCommandContext("a", "b", "c")

  def fixture(slug: String, nameConcept: String = null) = {
    val basic = fromFile(slug)
    val result = {
      if (nameConcept != null) {
        new ShapeBuilder(JsonLikeFrom.json(basic).get, "pa").run.asConceptNamed(nameConcept)
      } else {
        new ShapeBuilder(JsonLikeFrom.json(basic).get, "pa").run
      }
    }
    val eventStore = RfcServiceJSFacade.makeEventStore()
    val rfcService: RfcService = new RfcService(eventStore)
    rfcService.handleCommandSequence("id", result.commands, commandContext)
    (result.rootShapeId, rfcService.currentState("id"))
  }

  it("can provide a name to List of shapes") {
    val (id, spec) = fixture("primitive-array")
    val name = NameForShapeId.getFlatShapeName(id)(spec)
    assert(name == "List of String")
  }

  it("can name a nullable") {
    val (id, spec) = fixture("object-with-null-fields")
    val shapeId = spec.shapesState.flattenedField("pa_5").fieldShapeDescriptor.asInstanceOf[FieldShapeFromShape].shapeId

    val name = NameForShapeId.getFlatShapeName(shapeId)(spec, Some("pa_5"))
    assert(name == "Unknown (nullable)")
  }

  lazy val exampleRfc = {
    val commands = commandsFrom("shape-name-example")
    val eventStore = RfcServiceJSFacade.makeEventStore()
    val rfcService: RfcService = new RfcService(eventStore)
    rfcService.handleCommandSequence("id", commands, commandContext)
    rfcService.currentState("id")
  }

  it("works for maps") {
    val spec = exampleRfc
    val shapeId = spec.shapesState.flattenedField("field_vmgk9SSZck").fieldShapeDescriptor.asInstanceOf[FieldShapeFromShape].shapeId
    val name = NameForShapeId.getFlatShapeName(shapeId)(spec, Some("field_vmgk9SSZck"))
    assert(name == "Map from String to Dog")
  }

  it("works for one ofs") {
    val spec = exampleRfc
    val shapeId = spec.shapesState.flattenedField("field_iHuSkVboeG").fieldShapeDescriptor.asInstanceOf[FieldShapeFromShape].shapeId
    val name = NameForShapeId.getFlatShapeName(shapeId)(spec, Some("field_iHuSkVboeG"))
    assert(name == "List of Pet , Dog or Cat")
  }

  lazy val paginationExampleRfc = {
    val commands = commandsFrom("pagination")
    val eventStore = RfcServiceJSFacade.makeEventStore()
    val rfcService: RfcService = new RfcService(eventStore)
    rfcService.handleCommandSequence("id", commands, commandContext)
    rfcService.currentState("id")
  }

  it("can name list of pet ids") {
    val spec = paginationExampleRfc
    val shapeId = spec.shapesState.flattenedField("field_SWppoWn6kT").fieldShapeDescriptor.asInstanceOf[FieldShapeFromShape].shapeId
    val name = NameForShapeId.getFlatShapeName(shapeId)(spec, Some("field_SWppoWn6kT"))
    assert(name == "List of PetId")
  }

  it("can name generic") {
    val spec = paginationExampleRfc
    val name = NameForShapeId.getFlatShapeName("shape_YPyuORdmZ7")(spec)
    assert(name == "PaginatedList Item: Owner")
  }

  it("can name a field's shape") {
    val spec = paginationExampleRfc
    val name = NameForShapeId.getFieldIdShapeName("field_SWppoWn6kT")(spec).map(_.name).mkString(" ")

    assert(name == "List of PetId")
  }

  it("works for nested shapes") {
    val commands = commandsFrom("nested-naming")
    val eventStore = RfcServiceJSFacade.makeEventStore()
    val rfcService: RfcService = new RfcService(eventStore)
    rfcService.handleCommandSequence("id", commands, commandContext)
    rfcService.currentState("id")
    val spec = rfcService.currentState("id")

    val a= FlatShapeProjection.forShapeId("shape_Me4aQ0D3VR")(spec)

    assert(a.root.joinedTypeName == "abc")
  }
//
//  it("works for nested shapes") {
//
//
//
//    val eventStore = RfcServiceJSFacade.makeEventStore()
//    val rfcService: RfcService = new RfcService(eventStore)
//
//    val commands = Seq(
//      AddShape("inner", "$object", "I have a names"),
//      AddShape("outer", "inner", ""),
//    )
//    rfcService.handleCommandSequence("id", commands, commandContext)
//    val shapesState = rfcService.currentState("id").shapesState
//
//    val name = NameForShapeId.getFlatShapeName("outer")(shapesState)
//    println(name)
//  }

}

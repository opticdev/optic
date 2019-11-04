package com.seamless.contexts.shapes

import com.seamless.contexts.rfc.{RfcCommandContext, RfcService, RfcServiceJSFacade}
import com.seamless.contexts.shapes.Commands.FieldShapeFromShape
import com.seamless.contexts.shapes.projections.NameForShapeId
import com.seamless.diff._
import com.seamless.diff.initial.ShapeBuilder
import org.scalatest.FunSpec

class NameForShapeIdSpec extends FunSpec with JsonFileFixture {
  val commandContext: RfcCommandContext = RfcCommandContext("a", "b", "c")

  def fixture(slug: String, nameConcept: String = null) = {
    val basic = fromFile(slug)
    val result = {
      if (nameConcept != null) {
        new ShapeBuilder(basic, "pa").run.asConceptNamed(nameConcept)
      } else {
        new ShapeBuilder(basic, "pa").run
      }
    }
    val eventStore = RfcServiceJSFacade.makeEventStore()
    val rfcService: RfcService = new RfcService(eventStore)
    rfcService.handleCommandSequence("id", result.commands, commandContext)
    (result.rootShapeId, rfcService.currentState("id").shapesState)
  }

  it("can provide a name to List of shapes") {
    val (id, shapesState) = fixture("primitive-array")
    val name = NameForShapeId.getFlatShapeName(id)(shapesState)
    assert(name == "List of String")
  }

  it("can name a nullable") {
    val (id, shapesState) = fixture("object-with-null-fields")
    val shapeId = shapesState.flattenedField("pa_5").fieldShapeDescriptor.asInstanceOf[FieldShapeFromShape].shapeId

    val name = NameForShapeId.getFlatShapeName(shapeId)(shapesState, Some("pa_5"))
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
    val shapesState = exampleRfc.shapesState
    val shapeId = shapesState.flattenedField("field_vmgk9SSZck").fieldShapeDescriptor.asInstanceOf[FieldShapeFromShape].shapeId
    val name = NameForShapeId.getFlatShapeName(shapeId)(shapesState, Some("field_vmgk9SSZck"))
    assert(name == "Map from String to Dog")
  }

  it("works for one ofs") {
    val shapesState = exampleRfc.shapesState
    val shapeId = shapesState.flattenedField("field_iHuSkVboeG").fieldShapeDescriptor.asInstanceOf[FieldShapeFromShape].shapeId
    val name = NameForShapeId.getFlatShapeName(shapeId)(shapesState, Some("field_iHuSkVboeG"))
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
    val shapesState = paginationExampleRfc.shapesState
    val shapeId = shapesState.flattenedField("field_SWppoWn6kT").fieldShapeDescriptor.asInstanceOf[FieldShapeFromShape].shapeId
    val name = NameForShapeId.getFlatShapeName(shapeId)(shapesState, Some("field_SWppoWn6kT"))
    assert(name == "List of PetId")
  }

  it("can name generic") {
    val shapesState = paginationExampleRfc.shapesState
    val name = NameForShapeId.getFlatShapeName("shape_YPyuORdmZ7")(shapesState)
    assert(name == "PaginatedList Item: Owner")
  }

}

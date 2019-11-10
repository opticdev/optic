package com.seamless.contexts.shapes

import com.seamless.contexts.rfc.{RfcCommandContext, RfcService, RfcServiceJSFacade}
import com.seamless.contexts.shapes.Commands.FieldShapeFromShape
import com.seamless.contexts.shapes.ShapesHelper.ListKind
import com.seamless.contexts.shapes.projections.{FlatShapeProjection, NameForShapeId}
import com.seamless.diff.JsonFileFixture
import com.seamless.diff.initial.ShapeBuilder
import org.scalatest.FunSpec

class FlatShapeProjectionSpec extends FunSpec  with JsonFileFixture {

  val commandContext: RfcCommandContext = RfcCommandContext("a", "b", "c")
  def fixture(slug: String, nameConcept: String = null): (String, ShapesState) = {
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

  it("works on List of strings") {
    val (id, shapesState) = fixture("primitive-array")
    val render = FlatShapeProjection.forShapeId(id)(shapesState)
    assert(render.root.baseShapeId == ListKind.baseShapeId)
  }

  it("works on nested inline object") {
    val (id, shapesState) = fixture("nested-concept")
    val render = FlatShapeProjection.forShapeId(id)(shapesState)
    assert(render.root.fields.size == 1)
    assert(render.root.fields.head.fieldName == "c")
    assert(render.root.fields.head.shape.fields.size == 3)
  }

  it("works on named concepts") {
    val (id, shapesState) = fixture("todo", "ToDo")
    val render = FlatShapeProjection.forShapeId(id)(shapesState)
    assert(render.root.typeName.map(_.name).mkString == "ToDo")
    assert(render.root.fields.size == 4)
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

    val render = FlatShapeProjection.forShapeId(shapeId, Some("field_vmgk9SSZck"))(shapesState)

    assert(render.root.typeName.map(_.name).mkString(" ") == "Map from String to Dog")

    val shapeLinks = render.root.typeName.filter(_.shapeLink.isDefined)

    //Make sure the Map value link points to Dog concept
    assert(shapeLinks.size == 1)
    assert(shapeLinks.head.shapeLink.get == "shape_24Q6FI12UX")

    assert(render.parameterMap.contains("$string"))
    assert(render.parameterMap("shape_24Q6FI12UX").typeName.map(_.name).mkString == "Dog")
  }

  it("can name a nullable") {
    val (id, shapesState) = fixture("object-with-null-fields")
    val shapeId = shapesState.flattenedField("pa_5").fieldShapeDescriptor.asInstanceOf[FieldShapeFromShape].shapeId
    val render = FlatShapeProjection.forShapeId(shapeId, Some("pa_5"))(shapesState)

    assert(render.parameterMap.size == 1)

  }

  lazy val circleExampleRfc = {
    val commands = commandsFrom("circle-ci")
    val eventStore = RfcServiceJSFacade.makeEventStore()
    val rfcService: RfcService = new RfcService(eventStore)
    rfcService.handleCommandSequence("id", commands, commandContext)
    rfcService.currentState("id")
  }

  it("works on lists of concepts") {
    val shapesState = circleExampleRfc.shapesState

    val flatShape = FlatShapeProjection.forShapeId("concept_19_builds")(shapesState)

    assert(flatShape.root.joinedTypeName == "List of Build")
  }


//  it("works for one of") {  //getting an infinite loop
//    val shapesState = exampleRfc.shapesState
//
//    println(shapesState.shapes("shape_vZxyKGLPKw"))
//    val shapeId = shapesState.flattenedField("field_iHuSkVboeG").fieldShapeDescriptor.asInstanceOf[FieldShapeFromShape].shapeId
//    val render =FlatShapeProjection.forShapeId(shapeId, Some("field_iHuSkVboeG"))(shapesState)
//
//
//    null
//  }


}

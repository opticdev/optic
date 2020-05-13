package com.useoptic.contexts.shapes

import com.useoptic.contexts.rfc.{RfcCommandContext, RfcService, RfcServiceJSFacade, RfcState}
import com.useoptic.contexts.shapes.Commands.FieldShapeFromShape
import com.useoptic.contexts.shapes.ShapesHelper.ListKind
import com.useoptic.contexts.shapes.projections.{FlatShapeProjection, NameForShapeId}
import com.useoptic.diff.JsonFileFixture
import com.useoptic.diff.initial.ShapeBuilder
import com.useoptic.types.capture.JsonLikeFrom
import org.scalatest.FunSpec

class FlatShapeProjectionSpec extends FunSpec  with JsonFileFixture {

  val commandContext: RfcCommandContext = RfcCommandContext("a", "b", "c")
  def fixture(slug: String, nameConcept: String = null): (String, RfcState) = {
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

  it("works on List of strings") {
    val (id, spec) = fixture("primitive-array")
    val render = FlatShapeProjection.forShapeId(id)(spec)
    assert(render.root.baseShapeId == ListKind.baseShapeId)
  }

  it("works on nested inline object") {
    val (id, spec) = fixture("nested-concept")
    val render = FlatShapeProjection.forShapeId(id)(spec)
    assert(render.root.fields.size == 1)
    assert(render.root.fields.head.fieldName == "c")
    assert(render.root.fields.head.shape.fields.size == 3)
  }

  it("works on named concepts") {
    val (id, spec) = fixture("todo", "ToDo")
    val render = FlatShapeProjection.forShapeId(id)(spec)
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
    val spec = exampleRfc
    val shapeId = spec.shapesState.flattenedField("field_vmgk9SSZck").fieldShapeDescriptor.asInstanceOf[FieldShapeFromShape].shapeId

    val render = FlatShapeProjection.forShapeId(shapeId, Some("field_vmgk9SSZck"))(spec)

    assert(render.root.typeName.map(_.name).mkString(" ") == "Map from String to Dog")

    val shapeLinks = render.root.typeName.filter(_.shapeLink.isDefined)

    //Make sure the Map value link points to Dog concept
    assert(shapeLinks.size == 1)
    assert(shapeLinks.head.shapeLink.get == "shape_24Q6FI12UX")

    assert(render.parameterMap.contains("$string"))
    assert(render.parameterMap("shape_24Q6FI12UX").typeName.map(_.name).mkString == "Dog")
  }

  it("can name a nullable") {
    val (id, spec) = fixture("object-with-null-fields")
    val shapeId = spec.shapesState.flattenedField("pa_5").fieldShapeDescriptor.asInstanceOf[FieldShapeFromShape].shapeId
    val render = FlatShapeProjection.forShapeId(shapeId, Some("pa_5"))(spec)

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
    val spec = circleExampleRfc

    val flatShape = FlatShapeProjection.forShapeId("concept_19_builds")(spec)

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

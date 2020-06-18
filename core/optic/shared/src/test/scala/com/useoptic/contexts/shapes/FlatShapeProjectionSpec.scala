package com.useoptic.contexts.shapes

import com.useoptic.contexts.rfc.{RfcCommandContext, RfcService, RfcServiceJSFacade, RfcState}
import com.useoptic.contexts.shapes.Commands.FieldShapeFromShape
import com.useoptic.contexts.shapes.ShapesHelper.ListKind
import com.useoptic.contexts.shapes.projections.{FlatShapeQueries, NameForShapeId}
import com.useoptic.diff.JsonFileFixture
import com.useoptic.diff.initial.ShapeBuilder
import com.useoptic.diff.shapes.resolvers.DefaultShapesResolvers
import com.useoptic.dsa.OpticIds
import com.useoptic.types.capture.JsonLikeFrom
import org.scalatest.FunSpec

class FlatShapeQueriesSpec extends FunSpec with JsonFileFixture {

  val commandContext: RfcCommandContext = RfcCommandContext("a", "b", "c")

  def fixture(slug: String, nameConcept: String = null): (String, RfcState) = {
    implicit val ids = OpticIds.newDeterministicIdGenerator
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
    val (id, rfcState) = fixture("primitive-array")
    val shapesState = rfcState.shapesState
    val resolvers = new DefaultShapesResolvers(rfcState)
    val render = new FlatShapeQueries(resolvers, new NameForShapeId(resolvers, shapesState), shapesState).forShapeId(id)
    assert(render.root.baseShapeId == ListKind.baseShapeId)
  }

  it("works on nested inline object") {
    val (id, rfcState) = fixture("nested-concept")
    val shapesState = rfcState.shapesState
    val resolvers = new DefaultShapesResolvers(rfcState)

    val render = new FlatShapeQueries(resolvers, new NameForShapeId(resolvers, shapesState), shapesState).forShapeId(id)
    assert(render.root.fields.size == 1)
    assert(render.root.fields.head.fieldName == "c")
    assert(render.root.fields.head.shape.fields.size == 3)
  }

  it("works on named concepts") {
    val (id, rfcState) = fixture("todo", "ToDo")
    val shapesState = rfcState.shapesState
    val resolvers = new DefaultShapesResolvers(rfcState)
    val render = new FlatShapeQueries(resolvers, new NameForShapeId(resolvers, shapesState), shapesState).forShapeId(id)
    assert(render.root.typeName.map(_.name).mkString == "ToDo")
    assert(render.root.fields.size == 4)
  }


  lazy val exampleRfc = {
    val commands = commandsFrom("shape-name-example")
    val eventStore = RfcServiceJSFacade.makeEventStore()
    implicit val ids = OpticIds.newDeterministicIdGenerator
    val rfcService: RfcService = new RfcService(eventStore)
    rfcService.handleCommandSequence("id", commands, commandContext)
    rfcService.currentState("id")
  }


  it("works for maps") {
    val rfcState = exampleRfc
    val shapesState = rfcState.shapesState
    val shapeId = shapesState.flattenedField("field_vmgk9SSZck").fieldShapeDescriptor.asInstanceOf[FieldShapeFromShape].shapeId

    val resolvers = new DefaultShapesResolvers(rfcState)
    val render = new FlatShapeQueries(resolvers, new NameForShapeId(resolvers, shapesState), shapesState).forShapeId(shapeId, Some("field_vmgk9SSZck"))

    assert(render.root.typeName.map(_.name).mkString(" ") == "Map from String to Dog")

    val shapeLinks = render.root.typeName.filter(_.shapeLink.isDefined)

    //Make sure the Map value link points to Dog concept
    assert(shapeLinks.size == 1)
    assert(shapeLinks.head.shapeLink.get == "shape_24Q6FI12UX")

    assert(render.parameterMap.contains("$string"))
    assert(render.parameterMap("shape_24Q6FI12UX").typeName.map(_.name).mkString == "Dog")
  }

  it("can name a nullable") {
    val (id, rfcState) = fixture("object-with-null-fields")

    val shapesState = rfcState.shapesState
    val resolvers = new DefaultShapesResolvers(rfcState)
    val shapeId = shapesState.flattenedField("pa_5").fieldShapeDescriptor.asInstanceOf[FieldShapeFromShape].shapeId
    val render = new FlatShapeQueries(resolvers, new NameForShapeId(resolvers, shapesState), shapesState).forShapeId(shapeId, Some("pa_5"))

    assert(render.parameterMap.size == 1)

  }

  lazy val circleExampleRfc = {
    val commands = commandsFrom("circle-ci")
    val eventStore = RfcServiceJSFacade.makeEventStore()
    implicit val ids = OpticIds.newDeterministicIdGenerator
    val rfcService: RfcService = new RfcService(eventStore)
    rfcService.handleCommandSequence("id", commands, commandContext)
    rfcService.currentState("id")
  }

  it("works on lists of concepts") {
    val rfcState = circleExampleRfc

    val shapesState = rfcState.shapesState
    val resolvers = new DefaultShapesResolvers(rfcState)
    val flatShape = new FlatShapeQueries(resolvers, new NameForShapeId(resolvers, shapesState), shapesState).forShapeId("concept_19_builds")

    assert(flatShape.root.joinedTypeName == "List of Build")
  }
}

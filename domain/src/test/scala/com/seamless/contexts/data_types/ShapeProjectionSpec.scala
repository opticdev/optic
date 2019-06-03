package com.seamless.contexts.data_types

import com.seamless.contexts.data_types.Commands.{AddField, AssignType, DataTypesCommand, SetFieldName}
import com.seamless.contexts.data_types.Primitives.ObjectT
import com.seamless.contexts.data_types.projections.{Field, ObjectShape, ShapeProjection}
import org.scalatest.FunSpec

class ShapeProjectionSpec extends FunSpec {

  def fixture = new {
    val service = new DataTypesService
    val conceptId = DataTypesServiceHelper.newConceptId()
    val rootShapeId = DataTypesServiceHelper.newId()

    def handle(command: DataTypesCommand) = service.handleCommand("test-api", command)
    def addField(parent: String, name: String) = {
      val id = DataTypesServiceHelper.newId
      handle(AddField(parent, id, conceptId))
      handle(SetFieldName(id, name, conceptId))
      id
    }

    def currentState = service.currentState("test-api")

    handle(Commands.DefineConcept("test-schema", rootShapeId, conceptId))
  }

  it("can create a tree from the shape graph") {
    val f = fixture; import f._

    val obj = addField(rootShapeId, conceptId)
    handle(SetFieldName(obj, "nested-object", conceptId))
    handle(AssignType(obj, ObjectT, conceptId))

    val nestedField = addField(obj, conceptId)
    handle(SetFieldName(nestedField, "deep-field", conceptId))

    val shapeProjection = ShapeProjection.fromState(currentState, conceptId)

    assert(shapeProjection.root.isObjectFieldList)

    val fields = shapeProjection.root.asInstanceOf[ObjectShape]._fields
    assert(fields.size == 1)
    assert(fields.head.shape.isObjectFieldList)

    val subField = fields.head.shape.asInstanceOf[ObjectShape]._fields.head
    assert(subField.key == "deep-field")

  }

}

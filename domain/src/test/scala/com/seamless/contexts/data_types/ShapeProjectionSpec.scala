package com.seamless.contexts.data_types

import com.seamless.contexts.data_types.Commands.{AddField, AssignType, DataTypesCommand, SetFieldName, UpdateChildOccurrence}
import com.seamless.contexts.data_types.Primitives.{ObjectT, RefT}
import com.seamless.contexts.data_types.projections.{Field, ObjectShape, ShapeProjection}
import com.seamless.serialization.CommandSerialization
import io.circe.Json
import org.scalatest.FunSpec

class ShapeProjectionSpec extends FunSpec {

  def fixture = new {
    val service = new DataTypesService
    val conceptId = DataTypesServiceHelper.newConceptId()
    val rootShapeId = DataTypesServiceHelper.newId()

    def handle(command: DataTypesCommand) = service.handleCommand("test-api", command)
    def addField(parent: String, name: String, concept: String = conceptId) = {
      val id = DataTypesServiceHelper.newId
      handle(AddField(parent, id, concept))
      handle(SetFieldName(id, name, concept))
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

    val shapeProjection = ShapeProjection.all(currentState).concepts(conceptId)

    assert(shapeProjection.root.isObjectFieldList)
//
    val fields = shapeProjection.root.asInstanceOf[ObjectShape].fields
    assert(fields.size == 1)
    assert(fields.head.shape.isObjectFieldList)

    val subField = fields.head.shape.asInstanceOf[ObjectShape].fields.head
    assert(subField.key == "deep-field")

  }

  def pathToContents(file: String): String = {
    val loaded = scala.io.Source.fromFile(file)
    val source = loaded.getLines mkString "\n"
    loaded.close()
    source
  }

/*  it("can set a field in a ref to optional") {
    val f = fixture; import f._
    //make another concept
    handle(Commands.DefineConcept("other-concept", "other-rootId", "other-concept"))
    val fieldInRefId = addField("other-rootId", "fieldName", "other-concept")

    val id = addField(rootShapeId, "refField")
    handle(AssignType(id, RefT("other-concept"), f.conceptId))
    handle(UpdateChildOccurrence(fieldInRefId, rootShapeId, true, f.conceptId))


    val shapeProjection = ShapeProjection.fromState(currentState, conceptId)

    null
  }*/

}

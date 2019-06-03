package com.seamless.contexts.data_types

import com.seamless.contexts.data_types.Commands._
import com.seamless.contexts.data_types.Primitives.{ListT, NumberT, ObjectT, StringT}
import org.scalatest.FunSpec

class DataTypeStateBuilderSpec extends FunSpec {

  def fixture = new {
    val service = new DataTypesService
    val conceptId = DataTypesServiceHelper.newConceptId
    val rootShapeId = DataTypesServiceHelper.newId

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

  it("can add a field to root object, then change its name and type") {
    val f = fixture; import f._

    val id = addField(rootShapeId, "fieldName")
    handle(AssignType(id, NumberT, f.conceptId))

    assert(currentState.components(rootShapeId).fields.get.contains(id))
    assert(currentState.components(id).`type` == NumberT)
    assert(currentState.components(id).key.get == "fieldName")
  }

  it("can set root to type string") {
    val f = fixture; import f._
    handle(AssignType(rootShapeId, StringT, conceptId))
    val root = currentState.components(rootShapeId)
    assert(root.`type` == StringT)
    assert(root.fields.isEmpty)
  }

  it("can add fields to object, change object to primitive, then back to object and retrieve initial fields") {
    val f = fixture; import f._

    addField(rootShapeId, "a")
    addField(rootShapeId, "b")
    addField(rootShapeId, "c")


    handle(AssignType(rootShapeId, StringT, conceptId))
    assert(currentState.components(rootShapeId).fields.isEmpty)

    handle(AssignType(rootShapeId, ObjectT, conceptId))
    assert(currentState.components(rootShapeId).fields.get.size == 3)
  }

  it("can delete fields from an object") {
    val f = fixture; import f._

    addField(rootShapeId, "a")
    val toDeleteId = addField(rootShapeId, "b")

    handle(RemoveField(toDeleteId, conceptId))
    assert(currentState.components(rootShapeId).fields.get.size == 1)
    assert(!currentState.components.contains(toDeleteId))
  }
//
  it("can add fields to a nested-object") {
    val f = fixture; import f._

    val obj = addField(rootShapeId, conceptId)
    handle(SetFieldName(obj, "nested-object", conceptId))
    handle(AssignType(obj, ObjectT, conceptId))

    val nestedField = addField(obj, conceptId)
    handle(SetFieldName(nestedField, "deep-field", conceptId))

    assert(currentState.components(rootShapeId).fields.get.size == 1)

    assert(currentState.components(obj).fields.get == Seq(nestedField))
    assert(currentState.components(nestedField).parentId == obj)
  }

  it("can add type parameters to list") {
    val f = fixture; import f._

    val listId = addField(rootShapeId, conceptId)
    handle(AssignType(listId, ListT, conceptId))

    val param1Id = DataTypesServiceHelper.newId
    handle(AddTypeParameter(listId, param1Id, conceptId))
    handle(AssignType(param1Id, ObjectT, conceptId))

    assert(currentState.components(param1Id).`type` == ObjectT)
    assert(currentState.components(param1Id).key.isEmpty)
    assert(currentState.components(param1Id).typeParameters.isEmpty)

    assert(currentState.components(listId).`type` == ListT)
    assert(currentState.components(listId).typeParameters.get == Seq(param1Id))

  }

  it("can add and remove type parameters to list") {
    val f = fixture; import f._

    val listId = addField(rootShapeId, conceptId)
    handle(AssignType(listId, ListT, conceptId))

    val param1Id = DataTypesServiceHelper.newId
    handle(AddTypeParameter(listId, param1Id, conceptId))
    handle(AssignType(param1Id, ObjectT, conceptId))

    val param2Id = DataTypesServiceHelper.newId
    handle(AddTypeParameter(listId, param2Id, conceptId))
    handle(AssignType(param2Id, NumberT, conceptId))

    handle(RemoveTypeParameter(param1Id, conceptId))

    assert(currentState.components(param2Id).`type` == NumberT)
    assert(currentState.components(listId).`type` == ListT)
    assert(currentState.components(listId).typeParameters.get == Seq(param2Id))
  }

  it("can add type parameters that include custom objects") {
    val f = fixture; import f._

    val listId = addField(rootShapeId, conceptId)
    handle(AssignType(listId, ListT, conceptId))

    val param1Id = DataTypesServiceHelper.newId
    handle(AddTypeParameter(listId, param1Id, conceptId))
    handle(AssignType(param1Id, ObjectT, conceptId))

    addField(param1Id, "fieldA")
    addField(param1Id, "fieldB")
    addField(param1Id, "fieldC")

    assert(currentState.components(param1Id).`type` == ObjectT)
    assert(currentState.components(param1Id).fields.get.size == 3)
  }

}

package com.seamless.diff.initial

import com.seamless.contexts.rfc.Commands.RfcCommand
import com.seamless.contexts.shapes.Commands._
import com.seamless.contexts.shapes.ShapesHelper._
import com.seamless.contexts.shapes.{ShapesAggregate, ShapesState}
import com.seamless.diff.MutableCommandStream
import io.circe.Json

import scala.scalajs.js.annotation.JSExportAll
import scala.util.Random

sealed trait ShapeBuilderContext
case class IsField(named: String, parentId: String) extends ShapeBuilderContext
case class IsInArray(index: Int) extends ShapeBuilderContext
case class ValueShapeWithId(id: String, andFieldId: Option[String] = None) extends ShapeBuilderContext
case class IsRoot(forceId: String) extends ShapeBuilderContext

@JSExportAll
case class ShapeExample(shapeId: ShapeId, example: Json) {
  def exampleJs = {
    import io.circe.scalajs.convertJsonToJs
    convertJsonToJs(example)
  }
}

case class ShapeBuilderResult(rootShapeId: String, commands: Vector[RfcCommand], examples: Vector[ShapeExample], allIds: Vector[ShapeId]) {
  def asConceptNamed(name: String): ShapeBuilderResult =
    ShapeBuilderResult(rootShapeId, commands :+ RenameShape(rootShapeId, name), examples, allIds)
}

class ShapeBuilder(r: Json, seed: String = s"${Random.alphanumeric take 6 mkString}")(implicit shapesState: ShapesState = ShapesAggregate.initialState) {

  val commands = new MutableCommandStream
  val shapeExample = scala.collection.mutable.ListBuffer[ShapeExample]()
  val allIdsStore = scala.collection.mutable.ListBuffer[ShapeId]()

  def run: ShapeBuilderResult = {
    commands.clear
    shapeExample.clear()

    val matchedConcept = ShapeResolver.handleObject(r)
    //match to an existing concept if possible
    if (r.isObject && matchedConcept.isDefined) {
      return ShapeBuilderResult(matchedConcept.get, Vector.empty, Vector.empty, Vector.empty)
    }

    val rootShapeId = idGenerator
    fromJson(r)(IsRoot(rootShapeId), Seq.empty) // has the side effect of appending commands
    ShapeBuilderResult(rootShapeId, commands.toImmutable.flatten, shapeExample.toVector, allIdsStore.toVector)
  }

  private var count = 0

  private def idGenerator = {
    val id = s"${seed}_${count.toString}"
    count = count + 1
    allIdsStore.append(id)
    id
  }

  private def fromJson(json: Json)(implicit cxt: ShapeBuilderContext, path: Seq[String]): Unit = {

    val id = cxt match {
      case ValueShapeWithId(id, _) => id
      case IsRoot(forceId) => forceId
      case _ => idGenerator
    }

    if (json.isObject) {

      val matchedConcept = ShapeResolver.handleObject(json)
      //save the example
      shapeExample append ShapeExample(id, json)

      if (matchedConcept.isDefined) {
        commands.appendInit(AddShape(id, matchedConcept.get, ""))
      } else {
        commands.appendInit(AddShape(id, ObjectKind.baseShapeId, ""))
        fromJsonObject(json, id)
      }

    } else if (json.isArray) {
      commands.appendInit(AddShape(id, ListKind.baseShapeId, ""))
      cxt match {
        case id1: ValueShapeWithId if id1.andFieldId.isDefined =>
          fromArray(json, id, id1.andFieldId)
        case _ =>
          fromArray(json, id)
      }
    } else if (json.isBoolean) {
      commands.appendInit(AddShape(id, BooleanKind.baseShapeId, ""))
    } else if (json.isString) {
      commands.appendInit(AddShape(id, StringKind.baseShapeId, ""))
    } else if (json.isNumber) {
      commands.appendInit(AddShape(id, NumberKind.baseShapeId, ""))
    } else if (json.isNull) {
      commands.appendInit(AddShape(id, NullableKind.baseShapeId, ""))
      commands.appendDescribe(SetParameterShape(ProviderInShape(id, ShapeProvider(UnknownKind.baseShapeId), "$nullableInner")))
    }
  }

  def isPrimitive(json: Json) = {
    json.isString || json.isNumber || json.isBoolean || json.isNull
  }

  def primitiveShapeProvider(json: Json) = {
    if (json.isString) {
      StringKind
    } else if (json.isNumber) {
      NumberKind
    } else if (json.isBoolean) {
      BooleanKind
    } else {
      throw new Error("not a primitive")
    }
  }

  private def fromArray(a: Json, id: String, fieldId: Option[String] = None)(implicit cxt: ShapeBuilderContext, path: Seq[String]) = {
    val array = a.asArray.get

    val innerId = fieldId.getOrElse(id)
    if (array.isEmpty) {
      if (fieldId.isDefined) {
        commands.appendDescribe(SetParameterShape(ProviderInField(innerId, ShapeProvider(UnknownKind.baseShapeId), "$listItem")))
      } else {
        commands.appendDescribe(SetParameterShape(ProviderInShape(innerId, ShapeProvider(UnknownKind.baseShapeId), "$listItem")))
      }

    } else {
      //@todo let's add oneOf here
      if (isPrimitive(array.head)) {
        shapeExample append ShapeExample(innerId, array.head)
        if (fieldId.isDefined) {
          //save the example
          commands.appendDescribe(SetParameterShape(ProviderInField(innerId, ShapeProvider(primitiveShapeProvider(array.head).baseShapeId), "$listItem")))
        } else {
          commands.appendDescribe(SetParameterShape(ProviderInShape(innerId, ShapeProvider(primitiveShapeProvider(array.head).baseShapeId), "$listItem")))
        }
      } else {

        val matchedConcept = ShapeResolver.handleObject(array.head)
        val didMatch = array.head.isObject && matchedConcept.isDefined

        val assignedItemShapeId = if (didMatch) matchedConcept.get else idGenerator

        if (!didMatch) { // if no concept is matched inline it
          fromJson(array.head)(ValueShapeWithId(assignedItemShapeId), path :+ "[List Items]")
        }

        shapeExample append ShapeExample(innerId, array.head)

        if (fieldId.isDefined) {
          commands.appendDescribe(SetParameterShape(ProviderInField(innerId, ShapeProvider(assignedItemShapeId), "$listItem")))
        } else {
          commands.appendDescribe(SetParameterShape(ProviderInShape(innerId, ShapeProvider(assignedItemShapeId), "$listItem")))
        }
      }
    }
  }

  private def fromJsonObject(i: Json, id: String)(implicit cxt: ShapeBuilderContext, path: Seq[String]) = {
    val asMap = i.asObject.get.toList.sortBy(_._1)
    asMap.foreach {
      case (key, value) => fromField(value)(IsField(key, id), path :+ key)
    }
  }

  private def fromField(i: Json)(implicit cxt: IsField, path: Seq[String]) = {

    val fieldId = idGenerator

    val useThisShapeId = {
      if (isPrimitive(i)) {
        val valueShapeId = idGenerator
        fromJson(i)(ValueShapeWithId(valueShapeId, Some(fieldId)), path)
        valueShapeId
      } else {
        val issuedId = idGenerator
        fromJson(i)(ValueShapeWithId(issuedId, Some(fieldId)), path)
        issuedId
      }
    }

    commands.appendInit(AddField(
      fieldId,
      cxt.parentId,
      cxt.named,
      FieldShapeFromShape(fieldId, useThisShapeId)
    ))
  }

}

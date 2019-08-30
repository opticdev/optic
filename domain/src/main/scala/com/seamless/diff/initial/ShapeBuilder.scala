package com.seamless.diff.initial

import com.seamless.contexts.rfc.Commands.RfcCommand
import com.seamless.contexts.shapes.Commands.{AddField, AddShape, AddShapeParameter, FieldShapeFromShape, ProviderInField, ProviderInShape, RenameShape, SetParameterShape, ShapeProvider}
import com.seamless.contexts.shapes.ShapesHelper.{BooleanKind, ListKind, NumberKind, ObjectKind, StringKind}
import com.seamless.diff.MutableCommandStream
import io.circe.Json

import scala.util.{Random, Try}

sealed trait ShapeBuilderContext
case class IsField(named: String, parentId: String) extends ShapeBuilderContext
case class IsInArray(index: Int) extends ShapeBuilderContext
case class ValueShapeWithId(id: String, andFieldId: Option[String] = None) extends ShapeBuilderContext
case class IsRoot(forceId: String) extends ShapeBuilderContext


case class ShapeBuilderResult(rootShapeId: String, commands: Vector[RfcCommand]) {
  def asConceptNamed(name: String): ShapeBuilderResult =
    ShapeBuilderResult(rootShapeId, commands :+ RenameShape(rootShapeId, name))
}

class ShapeBuilder(r: Json, seed: String = s"${Random.alphanumeric take 6 mkString}") {

  var commands = new MutableCommandStream

  def run = {
    println("trying to infer a shape from "+ r.noSpaces)
    commands = new MutableCommandStream
    val rootShapeId = idGenerator
    fromJson(r)(IsRoot(rootShapeId)) // has the side effect of appending commands
    ShapeBuilderResult(rootShapeId, commands.toImmutable.flatten)
  }

  private var count = 0

  private def idGenerator = {
    val id = s"${seed}_${count.toString}"
    count = count + 1
    id
  }

  private def fromJson(json: Json)(implicit cxt: ShapeBuilderContext): Unit = {

    val id = cxt match {
      case ValueShapeWithId(id, _) => id
      case IsRoot(forceId) => forceId
      case _ => idGenerator
    }

    if (json.isObject) {
      commands.appendInit(AddShape(id, ObjectKind.baseShapeId, ""))
      fromJsonObject(json, id)
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
    }
  }

  def isPrimitive(json: Json) = {
    json.isString || json.isNumber || json.isBoolean
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

  private def fromArray(a: Json, id: String, fieldId: Option[String] = None)(implicit cxt: ShapeBuilderContext) = {
    val array = a.asArray.get

    val innerId = fieldId.getOrElse(id)
    if (array.isEmpty) {

      if (fieldId.isDefined) {
        commands.appendDescribe(SetParameterShape(ProviderInField(innerId, ShapeProvider("$any"), "$listItem")))
      } else {
        commands.appendDescribe(SetParameterShape(ProviderInShape(innerId, ShapeProvider("$any"), "$listItem")))
      }

    } else {
      //for now no oneOf...we'll support that later once we have shape hashing
      if (isPrimitive(array.head)) {
        if (fieldId.isDefined) {
          commands.appendDescribe(SetParameterShape(ProviderInField(innerId, ShapeProvider(primitiveShapeProvider(array.head).baseShapeId), "$listItem")))
        } else {
          commands.appendDescribe(SetParameterShape(ProviderInShape(innerId, ShapeProvider(primitiveShapeProvider(array.head).baseShapeId), "$listItem")))
        }
      } else {
        val assignedItemShapeId = idGenerator
        fromJson(array.head)(ValueShapeWithId(assignedItemShapeId))
        if (fieldId.isDefined) {
          commands.appendDescribe(SetParameterShape(ProviderInField(innerId, ShapeProvider(assignedItemShapeId), "$listItem")))
        } else {
          commands.appendDescribe(SetParameterShape(ProviderInShape(innerId, ShapeProvider(assignedItemShapeId), "$listItem")))
        }
      }
    }
  }

  private def fromJsonObject(i: Json, id: String)(implicit cxt: ShapeBuilderContext) = {
    val asMap = i.asObject.get.toList.sortBy(_._1)
    asMap.foreach {
      case (key, value) => fromField(value)(IsField(key, id))
    }
  }

  private def fromField(i: Json)(implicit cxt: IsField) = {

    val fieldId = idGenerator
    val valueShapeId = idGenerator
    fromJson(i)(ValueShapeWithId(valueShapeId, Some(fieldId)))

    commands.appendInit(AddField(
      fieldId,
      cxt.parentId,
      cxt.named,
      FieldShapeFromShape(fieldId, valueShapeId)
    ))
  }

}

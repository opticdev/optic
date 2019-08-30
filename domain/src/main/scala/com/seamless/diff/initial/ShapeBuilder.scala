package com.seamless.diff.initial

import com.seamless.contexts.rfc.Commands.RfcCommand
import com.seamless.contexts.shapes.Commands.{AddField, AddShape, AddShapeParameter, FieldShapeFromShape, ProviderInField, SetParameterShape, ShapeProvider}
import com.seamless.contexts.shapes.ShapesHelper.{BooleanKind, ListKind, NumberKind, ObjectKind, StringKind}
import com.seamless.diff.MutableCommandStream
import io.circe.Json

import scala.util.{Random, Try}

sealed trait ShapeBuilderContext
case class IsField(named: String, parentId: String) extends ShapeBuilderContext
case class IsInArray(index: Int) extends ShapeBuilderContext
case class ValueShapeWithId(id: String, andFieldId: Option[String] = None) extends ShapeBuilderContext
case object IsRoot extends ShapeBuilderContext

class ShapeBuilder(r: Json, seed: String = s"${Random.alphanumeric take 6 mkString}") {

  var commands = new MutableCommandStream

  def run = {
    commands = new MutableCommandStream
    if (!r.isObject) {
      throw new Error("Concepts learned from an example must have an object at their root")
    }
    fromJson(r)(IsRoot) // has the side effect of appending commands
    commands.toImmutable.flatten
  }

  private var count = 0

  private def idGenerator = {
    val id = s"${seed}_${count.toString}"
    count = count + 1
    id
  }

  private def fromJson(json: Json)(implicit cxt: ShapeBuilderContext = IsRoot): Unit = {
    val id = cxt match {
      case ValueShapeWithId(id, _) => id
      case _ => idGenerator
    }

    if (json.isObject) {
      commands.appendInit(AddShape(id, ObjectKind.baseShapeId, if (cxt == IsRoot) "Learned Concept" else ""))
      fromJsonObject(json, id)
    } else if (json.isArray) {
      commands.appendInit(AddShape(id, ListKind.baseShapeId, ""))
      fromArray(json, id, Try(cxt.asInstanceOf[ValueShapeWithId].andFieldId.get).toOption)
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
      commands.appendDescribe(SetParameterShape(ProviderInField(innerId, ShapeProvider("$any"), "$listItem")))
    } else {
      //for now no oneOf...we'll support that later once we have shape hashing
      if (isPrimitive(array.head)) {
        commands.appendDescribe(SetParameterShape(ProviderInField(innerId, ShapeProvider(primitiveShapeProvider(array.head).baseShapeId), "$listItem")))
      } else {
        val assignedItemShapeId = idGenerator
        fromJson(array.head)(ValueShapeWithId(assignedItemShapeId))
        commands.appendDescribe(SetParameterShape(ProviderInField(innerId, ShapeProvider(assignedItemShapeId), "$listItem")))
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

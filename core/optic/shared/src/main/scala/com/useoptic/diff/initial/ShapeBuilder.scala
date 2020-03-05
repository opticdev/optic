package com.useoptic.diff.initial

import com.useoptic.contexts.rfc.Commands.RfcCommand
import com.useoptic.contexts.shapes.Commands._
import com.useoptic.contexts.shapes.ShapesHelper._
import com.useoptic.contexts.shapes.{ShapesAggregate, ShapesState}
import com.useoptic.diff.MutableCommandStream
import com.useoptic.types.capture.{JsonLike, JsonLikeFrom}
import io.circe.Json

import scala.scalajs.js.annotation.JSExportAll
import scala.util.Random

sealed trait ShapeBuilderContext

case class IsField(named: String, parentId: String) extends ShapeBuilderContext

case class IsInArray(index: Int) extends ShapeBuilderContext

case class ValueShapeWithId(id: String, andFieldId: Option[String] = None) extends ShapeBuilderContext

case class IsRoot(forceId: String) extends ShapeBuilderContext

case class ShapeBuilderResult(rootShapeId: String, commands: Vector[RfcCommand], allIds: Vector[ShapeId]) {
  def asConceptNamed(name: String): ShapeBuilderResult =
    ShapeBuilderResult(rootShapeId, commands :+ RenameShape(rootShapeId, name), allIds)
}

class ShapeBuilder(r: JsonLike, seed: String = s"${Random.alphanumeric take 6 mkString}")(implicit shapesState: ShapesState = ShapesAggregate.initialState) {
  // test fixture helper
  def this(r: Json, seed: String) = this(JsonLikeFrom.json(r).get, seed)

  val commands = new MutableCommandStream
  val allIdsStore = scala.collection.mutable.ListBuffer[ShapeId]()

  def run: ShapeBuilderResult = {
    commands.clear

    //    //match to an existing concept if possible
    //    if (r.isObject && matchedConcept.isDefined) {
    //      return ShapeBuilderResult(matchedConcept.get, Vector.empty, Vector.empty, Vector.empty)
    //    }

    val rootShapeId = idGenerator
    fromJson(r)(IsRoot(rootShapeId), Seq.empty) // has the side effect of appending commands
    ShapeBuilderResult(rootShapeId, commands.toImmutable.flatten, allIdsStore.toVector)
  }

  private var count = 0

  private def idGenerator = {
    val id = s"${seed}_${count.toString}"
    count = count + 1
    allIdsStore.append(id)
    id
  }

  private def fromJson(json: JsonLike)(implicit cxt: ShapeBuilderContext, path: Seq[String]): Unit = {

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
    } else if (json.isNull) {
      commands.appendInit(AddShape(id, NullableKind.baseShapeId, ""))
      val unknownWrapperId = idGenerator
      commands.appendInit(AddShape(unknownWrapperId, UnknownKind.baseShapeId, ""))
      commands.appendDescribe(SetParameterShape(ProviderInShape(id, ShapeProvider(unknownWrapperId), "$nullableInner")))
    }
  }

  def isPrimitive(json: JsonLike) = {
    json.isString || json.isNumber || json.isBoolean || json.isNull
  }

  def primitiveShapeProvider(json: JsonLike) = {
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

  private def fromArray(a: JsonLike, id: String, fieldId: Option[String] = None)(implicit cxt: ShapeBuilderContext, path: Seq[String]) = {
    val array = a.items

    val innerId = fieldId.getOrElse(id)
    if (array.isEmpty) {
      val unknownWrapperId = idGenerator
      commands.appendInit(AddShape(unknownWrapperId, UnknownKind.baseShapeId, ""))
      commands.appendDescribe(SetParameterShape(ProviderInShape(id, ShapeProvider(unknownWrapperId), "$listItem")))
    } else {
      //@todo let's add oneOf here
      if (isPrimitive(array.head)) {
        val primitiveWrapperId = idGenerator
        val primitiveId = primitiveShapeProvider(array.head).baseShapeId
        commands.appendInit(AddShape(primitiveWrapperId, primitiveId, ""))
        commands.appendDescribe(SetParameterShape(ProviderInShape(id, ShapeProvider(primitiveWrapperId), "$listItem")))

      } else {

        val assignedItemShapeId =idGenerator

        fromJson(array.head)(ValueShapeWithId(assignedItemShapeId), path :+ "[List Items]")
        val wrapperId = idGenerator
        commands.appendInit(AddShape(wrapperId, assignedItemShapeId, ""))
        commands.appendDescribe(SetParameterShape(ProviderInShape(id, ShapeProvider(wrapperId), "$listItem")))
      }
    }
  }

  private def fromJsonObject(i: JsonLike, id: String)(implicit cxt: ShapeBuilderContext, path: Seq[String]) = {
    val asMap = i.fields.toList.sortBy(_._1)
    asMap.foreach {
      case (key, value) => fromField(value)(IsField(key, id), path :+ key)
    }
  }

  private def fromField(i: JsonLike)(implicit cxt: IsField, path: Seq[String]) = {

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

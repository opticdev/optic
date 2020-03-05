package com.useoptic.diff

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.contexts.shapes.Commands.{DynamicParameterList, FieldShapeFromParameter, FieldShapeFromShape, NoProvider, ParameterProvider, ShapeId, ShapeProvider}
import com.useoptic.contexts.shapes.ShapesHelper._
import com.useoptic.contexts.shapes.projections.NameForShapeId
import com.useoptic.contexts.shapes.{ShapeEntity, ShapesHelper}
import com.useoptic.diff.ShapeDiffer.{resolveBaseObject, resolveParameterShape}
import io.circe.Json

abstract class ShapeLike {
  def isEmpty: Boolean
  def id: String
  def idOption: Option[String]
  def isSpecShape: Boolean = false

  def isString: Boolean
  def isBoolean: Boolean
  def isNumber: Boolean
  def isNull: Boolean

  def isArray: Boolean
  def items: Vector[ShapeLike]

  def isObject: Boolean
  def fields: Map[String, ShapeLike]
  def getField(key: String): ShapeLike

  def asJson: Json
  def asJsonOption: Option[Json]

  def asShapeEntityOption: Option[ShapeEntity]

  def asJs: ShapeLikeJs = ShapeLikeJs(asJsonOption, idOption)
  def asJsOption: Option[ShapeLikeJs] = if (isEmpty) None else Some(asJs)
}

case class ShapeLikeJs(json: Option[Json] = None, id: Option[String] = None)

object ShapeLike {
  def fromActualJson(jsonOption: Option[Json]): ShapeLike = new ShapeLike {
    def id: String = null
    def idOption: Option[String] = None
    override def isEmpty: Boolean = jsonOption.isEmpty

    override def isString: Boolean = jsonOption.exists(_.isString)
    override def isBoolean: Boolean = jsonOption.exists(_.isBoolean)
    override def isNumber: Boolean = jsonOption.exists(_.isNumber)
    override def isNull: Boolean = jsonOption.exists(_.isNull)

    override def isArray: Boolean = jsonOption.exists(_.isArray)
    override def items: Vector[ShapeLike] = jsonOption.get.asArray.get.map(i => fromActualJson(Some(i)))

    override def isObject: Boolean = jsonOption.exists(_.isObject)

    override def fields: Map[String, ShapeLike] = {
      jsonOption.get.asObject.get.toMap.map {
        case (key, value) => (key, fromActualJson(Some(value)))
      }
    }

    def getField(key: String): ShapeLike = fields.getOrElse(key, fromActualJson(None))

    override def asJson: Json = jsonOption.get
    override def asJsonOption: Option[Json] = jsonOption

    override def asShapeEntityOption: Option[ShapeEntity] = None
  }

  def fromShapeEntity(shapeEntityOption: Option[ShapeEntity], rfcState: RfcState, _id: String = null): ShapeLike = new ShapeLike {
    override def isEmpty: Boolean = shapeEntityOption.isEmpty
    def id: String = _id
    def idOption: Option[String] = Some(id)

    override def isSpecShape: Boolean = true

    private def asCoreShape: CoreShapeKind = ShapesHelper.toCoreShape(shapeEntityOption.get, rfcState.shapesState)

    override def isString: Boolean = asCoreShape == StringKind
    override def isBoolean: Boolean = asCoreShape == BooleanKind
    override def isNumber: Boolean = asCoreShape == NumberKind
    override def isNull: Boolean = asCoreShape == NullableKind


    override def isArray: Boolean = asCoreShape == ListKind

    override def items: Vector[ShapeLike] = {
      //@todo shape & field cases
      val bindings = rfcState.shapesState.resolveParameterBindings(id)
      val itemShape = resolveParameterShape(id, "$listItem")(rfcState.shapesState, bindings)
      if (itemShape.isDefined) {
        val oneOfId = itemShape.get.shapeId
        if (itemShape.get.descriptor.baseShapeId == OneOfKind.baseShapeId) {
          val shapeParameterIds = itemShape.get.descriptor.parameters match {
            case DynamicParameterList(shapeParameterIds) => shapeParameterIds
          }
          shapeParameterIds.map(paramId => {
            val innerShape = resolveParameterShape(oneOfId, paramId)(rfcState.shapesState, bindings)
            ShapeLike.fromShapeEntity(innerShape, rfcState)
          }).toVector
        } else {
          Vector(ShapeLike.fromShapeEntity(itemShape, rfcState))
        }
      } else {
        Vector()
      }
    }

    override def isObject: Boolean = asCoreShape == ObjectKind
    override def fields: Map[String, ShapeLike] = {
      val baseObject = resolveBaseObject(shapeEntityOption.get.shapeId)(rfcState.shapesState)

      val fieldsAll = baseObject.descriptor.fieldOrdering.map(fieldId => {
        val flattenedField = rfcState.shapesState.flattenedField(fieldId)

        if (flattenedField.isRemoved) {
          None
        } else {
          val expectedFieldShape = flattenedField.fieldShapeDescriptor match {
            case fsd: FieldShapeFromShape => {
              Some(rfcState.shapesState.shapes(fsd.shapeId))
            }
            case fsd: FieldShapeFromParameter => {
              flattenedField.bindings(fsd.shapeParameterId) match {
                case Some(value) => value match {
                  case p: ParameterProvider => {
                    None
                  }
                  case p: ShapeProvider => Some(rfcState.shapesState.shapes(p.shapeId))
                  case p: NoProvider => None
                }
                case None => None
              }
            }
          }
          Some((flattenedField.name, fromShapeEntity(expectedFieldShape, rfcState, flattenedField.fieldId)))
        }
      })

      fieldsAll.flatten.toMap
    }

//    def getField(key: String, id: Option[String] = None): Option[ShapeLike] = {
//      val a = this.fields
//      fields.find(_._2.id == id).map(i => i._2)
//    }

    override def asJson: Json = {
      null
    }

    override def asJsonOption: Option[Json] = Some(asJson)

    override def getField(key: String): ShapeLike = fields.getOrElse(key, fromShapeEntity(None, rfcState, null))
    override def asShapeEntityOption: Option[ShapeEntity] = shapeEntityOption
  }

//  def fromShapeHash(shapeHash: ShapeHash): ShapeLike = new ShapeLike {
//    override def isEmpty: Boolean = false
//    override def id: String = null
//    override def idOption: Option[String] = None
//
//    override def isString: Boolean = shapeHash.`type`.isString
//
//    override def isBoolean: Boolean = shapeHash.`type`.isBoolean
//
//    override def isNumber: Boolean = shapeHash.`type`.isNumber
//
//    override def isNull: Boolean = shapeHash.`type`.isNull
//
//    override def isArray: Boolean = shapeHash.`type`.isArray
//
//    override def items: Vector[ShapeLike] = shapeHash.items.map(fromShapeHash).toVector
//
//    override def isObject: Boolean = shapeHash.`type`.isObject
//
//    override def fields: Map[String, ShapeLike] = {
//      shapeHash.fields.collect {
//        case i if i.hash.isDefined => i.key -> fromShapeHash(i.hash.get)
//      }.toMap
//    }
//
//    override def getField(key: String): ShapeLike = shapeHash.fields.find(_.key == key).map(i => fromShapeHash(i.hash.get)).get
//
//    override def asJson: Json = null //@todo (something for examples
//
//    override def asJsonOption: Option[Json] = None
//
//    override def asShapeEntityOption: Option[ShapeEntity] = None
//  }

}

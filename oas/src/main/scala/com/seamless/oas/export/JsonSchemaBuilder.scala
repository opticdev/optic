package com.seamless.oas.export

import com.seamless.contexts.shapes.Commands.{FieldShapeFromShape, NoProvider, ParameterProvider, ProviderDescriptor, ShapeId, ShapeParameterId, ShapeProvider}
import com.seamless.contexts.shapes.{FlattenedField, FlattenedShape, Parameter, ShapesState}
import com.seamless.contexts.shapes.projections.NamedShape
import io.circe.{Json, JsonObject}

class JsonSchemaBuilder(shapesState: ShapesState, namedShapes: Map[ShapeId, NamedShape]) {

  import FlattenedShapeHelpers._

  lazy val definitionsURIs = {
    val uris = namedShapes.map {
      case (id, namedShape) => {
        val camelCased = namedShape.name.toCamelCase
        (id, s"#/components/schemas/${camelCased}")
      }
    }
    //@todo de-dup as needed (names are user-defined which allows conflicts)
    uris
  }

  lazy val namedShapeBuilders: Map[ShapeId, GenericSchemaBuilder] = {
    namedShapes.map { case (id, shape) =>
      val flatShape = shapesState.flattenedShape(shape.shapeId)
      (id, flatShape match {
        case x if x.parameters.nonEmpty => {
          GenericSchemaBuilder(x, b => fromShapeId(x.shapeId, b).asJson, Some(genericInliner(x)))
        }
        case x => GenericSchemaBuilder(x, b => fromShapeId(x.shapeId, b).asJson)
      })
    }
  }

  def sharedSchemas: Vector[(String, Json)] = {
    namedShapeBuilders.toVector.map {
      case (shapeId, builder) => {
        namedShapes(shapeId).name.toCamelCase -> builder.baseSchema(Map.empty)
      }
    }.sortBy(_._1)
  }

  def hasGenerics(shapeId: ShapeId) = namedShapeBuilders.exists(i => i._1 == shapeId && i._2.hasGenerics)
  def getGenericBuilder(shapeId: ShapeId): GenericSchemaBuilder = namedShapeBuilders.find(i => i._1 == shapeId && i._2.hasGenerics).map(_._2).get

  def fromShapeId(id: String, bindingsCtx: Bindings = Map.empty)(implicit schema: JsonSchemaWrite = new JsonSchemaWrite): JsonSchemaWrite = {

    val shape = shapesState.flattenedShape(id)

    if (shape.renderedInline && !shape.baseShapeId.isIDType) {

      schema.assignType(shape.jsonSchemaType)

      if (shape.isObject) {
        schema addProperties shape.fields.collect {
          case field if !field.isRemoved && field.fieldShapeDescriptor.isInstanceOf[FieldShapeFromShape] => {
            val fieldShape = fromShapeId(field.fieldShapeDescriptor.asInstanceOf[FieldShapeFromShape].shapeId, field.bindings)(new JsonSchemaWrite)
            (field.name, fieldShape.asJson)
          }
        }
      }

      if (shape.isList) {
        val paramIdOption = shape.parameters.find(_.name == "T")//.get.shapeParameterId

        val listItemType = if (paramIdOption.isDefined) {
          bindingsCtx(paramIdOption.get.shapeParameterId).resolveShapeId.getOrElse("$any")
        } else {
          shape.bindings("$listItem").resolveShapeId.getOrElse("$any")
        }

        schema addItems referenceFromListTypeParameter(listItemType)
      }

    } else if (shape.baseShapeId.isIDType) {
      //handle id and reference types
      shape.baseShapeId match {
        case "$identifier" => {
          val concreteIdentifierType = shape.bindings("$identifierInner").resolveShapeId.getOrElse("$any")
          val idSchema = new JsonSchemaWrite
          idSchema assignType concreteIdentifierType.jsonSchemaType
          idSchema description s"An identifier represented as a ${concreteIdentifierType.jsonSchemaType}"
          schema replaceWith idSchema.asJson
        }
        case "$reference" => {
          val referenceTo = shape.bindings("$referenceInner").resolveShapeId.getOrElse("$any")
          val namedShape = namedShapes(referenceTo)
          val fields = extractFields( shapesState.flattenedShape(namedShape.shapeId))

          val identifierField = fields.find { case f =>
            val subshape = shapesState.flattenedShape(f.fieldShapeId)
            subshape.baseShapeId == "$identifier"
          }

          val referenceType = identifierField.flatMap(i => fromShapeId(i.fieldShapeId, bindingsCtx).asJson.asObject.get("type"))
              .getOrElse(Json.fromString("string"))

          val refSchema = new JsonSchemaWrite
          refSchema assignType referenceType
          refSchema description s"A reference to an entity of ${namedShape.name}"
          schema replaceWith refSchema.asJson
        }
      }

    } else {
      //Handle Generics and Refs
      if (hasGenerics(shape.baseShapeId)) {
        val genericBuilder = getGenericBuilder(shape.baseShapeId)
        val inlinedSchema = genericBuilder.inliner.get(shape.bindings)
        val baseSchemaRef = referenceFromListTypeParameter(shape.baseShapeId)
        schema.allOf(Seq(baseSchemaRef, inlinedSchema))
      } else {
        val ref = referenceFromListTypeParameter(shape.baseShapeId)
        schema replaceWith ref
      }
    }
    schema
  }

  case class FieldWithPath(path: Seq[String], fieldShapeId: String, flattenedField: FlattenedField, parameters: Option[Seq[Parameter]] = None, bindings: Option[Bindings] = None)
  def extractFields(shape: FlattenedShape, path: Seq[String] = Seq.empty): Seq[FieldWithPath] = {
    shape.fields.flatMap { case i =>
      val fieldShapeId = i.fieldShapeDescriptor.asInstanceOf[FieldShapeFromShape].shapeId
      val fieldShape = shapesState.flattenedShape(fieldShapeId)
      val pathUpdated = path :+ i.name
      if (fieldShape.renderedInline && fieldShape.parameters.isEmpty) {
        extractFields(fieldShape, pathUpdated) :+ FieldWithPath(pathUpdated, fieldShapeId, i)
      } else {
        Seq(FieldWithPath(pathUpdated, fieldShapeId, i, Some(fieldShape.parameters), Some(i.bindings)))
      }
    }
  }

  def genericInliner(shape: FlattenedShape): Bindings => Json = (bindingsCtx: Bindings) => {
    val allFields = extractFields(shape)
    val genericFields = allFields.filter(_.parameters.isDefined)

    genericFields.map { case genericField =>

      val resolvedBindings = genericField.bindings.getOrElse(Map.empty).mapValues{
        case Some(a: ParameterProvider) => {
          bindingsCtx(a.shapeParameterId)
        }
        case x => x
      }

      val innerSchema = fromShapeId(genericField.fieldShapeId, resolvedBindings).asJson
      genericField.path.foldRight(innerSchema) {
        case (key, obj) => {
          Json.obj(
            "type" -> Json.fromString("object"),
            "properties" -> Json.obj(
              key -> obj
            )
          )
        }
      }

    }.foldLeft(Json.obj()) {
      case (i, obj) => obj.deepMerge(i)
    }
  }

  def referenceFromListTypeParameter(shapeId: ShapeId): Json = {
    val schema = new JsonSchemaWrite
    if (shapeId.isCoreShape) {
      schema.assignType(shapeId.jsonSchemaType)
    } else if (definitionsURIs.contains(shapeId)) {
      schema.addRef(Json.fromString(definitionsURIs(shapeId)))
    }
    schema.asJson
  }

}

class JsonSchemaWrite {
  private var _internal = Json.obj().asObject.get

  def assignType(json: Json) = {
    _internal = _internal.add("type", json)
  }

  def addProperties(fields: Seq[(String, Json)]) = {
    _internal = _internal.add("properties", Json.obj(fields:_*))
  }

  def addItems(json: Json) = {
    _internal = _internal.add("items", json)
  }

  def addRef(json: Json) = {
    _internal = _internal.add("$ref", json)
  }

  def allOf(innerSchemas: Seq[Json]) = {
    _internal = Json.obj(
      "allOf" -> Json.arr(innerSchemas:_*)
    ).asObject.get
  }

  def description(string: String) = {
    _internal = _internal.add("description", Json.fromString(string))
  }

  def replaceWith(json: Json) = _internal = json.asObject.get

  def asJson = Json.fromJsonObject(_internal)
}

object FlattenedShapeHelpers {

  implicit class StringHelpersImpl(s: String) {
    def toCamelCase: String  = {
      val split = s.split(" ")
      val tail = split.tail.map { x => x.head.toUpper + x.tail }
      split.head + tail.mkString
    }
  }

  implicit class ShapeIdsHelpersImpl(shapeId: ShapeId) {
    def isCoreShape = Set(
      "$string", "$number", "$boolean", "$object", "$list", "$map", "$identifier", "$reference", "$any"
    ).contains(shapeId)

    def isIDType = Set("$identifier", "$reference").contains(shapeId)
    def jsonSchemaType: Json = {
      //'$string', '$number', '$boolean', '$object', '$list', '$map', /*'$oneOf',*/ '$identifier', '$reference', '$any'
      shapeId match {
        //primitives
        case "$string" => Json.fromString("string")
        case "$number" => Json.fromString("number")
        case "$boolean" => Json.fromString("boolean")
        case "$any" => Json.obj()

        case "$object" => Json.fromString("object")
        case "$list" => Json.fromString("array")
        case "$map" => Json.fromString("object")

        case _ => throw new Error("Not implemented "+ shapeId)
      }
    }
  }

  implicit class FlattenedShapeHelpersImpl(shape: FlattenedShape) {
    def isCoreShape = new ShapeIdsHelpersImpl(shape.coreShapeId).isCoreShape
    def isObject: Boolean = shape.coreShapeId == "$object"
    def isList: Boolean = shape.coreShapeId == "$list"
    def renderedInline = shape.coreShapeId == shape.baseShapeId
    def jsonSchemaType: Json = new ShapeIdsHelpersImpl(shape.coreShapeId).jsonSchemaType
  }

  implicit class ProviderDescriptorHelpersImpl(provider: Option[ProviderDescriptor]) {
    def resolveShapeId = provider.flatMap {
      case ParameterProvider(id) => Some(id)
      case ShapeProvider(id) => Some(id)
      case NoProvider() => None
    }
  }
}

package com.useoptic.diff.shapes

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.contexts.shapes._
import com.useoptic.contexts.shapes.Commands._
import com.useoptic.contexts.shapes.ShapesHelper._
import com.useoptic.diff.interactions.{BodyUtilities, InteractionTrail, RequestBody, RequestSpecTrail, RequestSpecTrailHelpers, ResponseBody}
import com.useoptic.diff.shapes.JsonTrailPathComponent._
import com.useoptic.logging.Logger
import com.useoptic.types.capture.{HttpInteraction, JsonLike}
import io.circe.Json


object Resolvers {

  case class ResolvedTrail(shapeEntity: ShapeEntity, coreShapeKind: CoreShapeKind, bindings: ParameterBindings)

  type ParameterBindings = Map[ShapeParameterId, Option[ProviderDescriptor]]

  def resolveTrailToCoreShape(spec: RfcState, trail: ShapeTrail, bindings: ParameterBindings = Map.empty): ResolvedTrail = {
    val rootShape = spec.shapesState.shapes(trail.rootShapeId)
    //@GOTCHA: might need to resolve rootShape to its lowest baseShapeId
    val rootShapeCoreShape = toCoreShape(rootShape, spec.shapesState)
    var resolved: ResolvedTrail = ResolvedTrail(rootShape, rootShapeCoreShape, bindings)
    for (pathComponent <- trail.path) {
      resolved = resolveTrailPath(spec.shapesState, resolved, pathComponent)
    }
    resolved
  }

  def resolveTrailToCoreShapeFromParent(spec: RfcState, parent: ResolvedTrail, childTrail: Seq[ShapeTrailPathComponent]): ResolvedTrail = {
    var resolved = parent
    for (pathComponent <- childTrail) {
      resolved = resolveTrailPath(spec.shapesState, resolved, pathComponent)
    }
    resolved
  }

  case class ChoiceOutput(parentTrail: ShapeTrail, additionalComponents: Seq[ShapeTrailPathComponent], shapeId: ShapeId, coreShapeKind: CoreShapeKind) {
    def shapeTrail(): ShapeTrail = parentTrail.withChildren(additionalComponents: _*)
  }

  def flattenChoice(spec: RfcState, parentTrail: ShapeTrail, additionalComponents: Seq[ShapeTrailPathComponent], bindings: ParameterBindings): Seq[ChoiceOutput] = {
    val choices = listTrailChoices(spec, parentTrail.withChildren(additionalComponents: _*), bindings)
    Logger.log("sentinel-flattenChoice")
    Logger.log(choices)
    choices
  }

  def listTrailChoices(spec: RfcState, trail: ShapeTrail, bindings: ParameterBindings): Seq[ChoiceOutput] = {
    val shapesState = spec.shapesState
    val resolved = resolveTrailToCoreShape(spec, trail, bindings)
    resolved.coreShapeKind match {
      case UnknownKind => {
        Seq(
          //ChoiceOutput(trail, Seq(UnknownTrail()), resolved.shapeEntity.shapeId, resolved.coreShapeKind)
        )
      }
      case NullableKind => {
        val itemShape = resolveParameterToShape(shapesState, resolved.shapeEntity.shapeId, NullableKind.innerParam, resolved.bindings).get
        Seq(
          ChoiceOutput(trail, Seq(NullableTrail()), resolved.shapeEntity.shapeId, resolved.coreShapeKind),
        ) ++ flattenChoice(spec, trail, Seq(NullableTrail(), NullableItemTrail(itemShape.shapeId)), bindings)
      }
      case OptionalKind => {
        val itemShape = resolveParameterToShape(shapesState, resolved.shapeEntity.shapeId, OptionalKind.innerParam, resolved.bindings).get
        Seq(
          ChoiceOutput(trail, Seq(OptionalTrail()), resolved.shapeEntity.shapeId, resolved.coreShapeKind),
        ) ++ flattenChoice(spec, trail, Seq(OptionalTrail(), OptionalItemTrail(itemShape.shapeId)), bindings)
      }
      case OneOfKind => {
        val shapeParameterIds = resolved.shapeEntity.descriptor.parameters match {
          case DynamicParameterList(shapeParameterIds) => shapeParameterIds
          case _ => Seq.empty
        }
        val oneOfShapeId = resolved.shapeEntity.shapeId
        shapeParameterIds.flatMap(shapeParameterId => {
          val itemShape = Resolvers.resolveParameterToShape(shapesState, oneOfShapeId, shapeParameterId, resolved.bindings).get

          flattenChoice(spec, trail, Seq(OneOfTrail(oneOfShapeId), OneOfItemTrail(oneOfShapeId, shapeParameterId, itemShape.shapeId)), bindings)
        })
      }
      case _ => Seq(
        ChoiceOutput(trail, Seq.empty, resolved.shapeEntity.shapeId, resolved.coreShapeKind)
      )
    }
  }

  def resolveTrailPath(shapesState: ShapesState, parent: ResolvedTrail, pathComponent: ShapeTrailPathComponent): ResolvedTrail = {
    parent.coreShapeKind match {
      case NullableKind => {
        pathComponent match {
          case c: NullableTrail => parent
          case c: NullableItemTrail => {
            val (shapeId, coreShapeKind) = toCoreAndBaseShape(shapesState.shapes(c.innerShapeId), shapesState)
            ResolvedTrail(shapesState.shapes(shapeId), coreShapeKind, parent.bindings)
          }
          case _ => throw new Error("did not expect a non-nullable path relative to a NullableKind")
        }
      }
      case OptionalKind => {
        pathComponent match {
          case c: OptionalTrail => parent
          case c: OptionalItemTrail => {
            val (shapeId, coreShapeKind) = toCoreAndBaseShape(shapesState.shapes(c.innerShapeId), shapesState)
            ResolvedTrail(shapesState.shapes(shapeId), coreShapeKind, parent.bindings)
          }
          case _ => throw new Error("did not expect a non-optional path relative to a OptionalKind")
        }
      }
      case OneOfKind => {
        pathComponent match {
          case c: OneOfTrail => parent
          case c: OneOfItemTrail => {
            val (shapeId, coreShapeKind) = toCoreAndBaseShape(shapesState.shapes(c.itemShapeId), shapesState)
            ResolvedTrail(shapesState.shapes(shapeId), coreShapeKind, parent.bindings)
          }
          case _ => throw new Error("did not expect a non-oneOfItem path relative to a OneOf")
        }
      }
      case ObjectKind => {
        pathComponent match {
          case c: ObjectFieldTrail => {
            resolveFieldToShape(shapesState, c.fieldId, parent.bindings) match {
              case Some(value) => value
              case None => throw new Error("expected field to resolve to a shape")
            }
          }
          case _ => throw new Error("did not expect a non-field path relative to an object")
        }
      }
      case ListKind => {
        pathComponent match {
          case c: ListItemTrail => {
            resolveParameterToShape(shapesState, c.listShapeId, ListKind.innerParam, parent.bindings) match {
              case Some(value) => {
                val (shapeId, coreShapeKind) = toCoreAndBaseShape(value, shapesState)
                ResolvedTrail(shapesState.shapes(shapeId), coreShapeKind, parent.bindings)
              }
              case None => throw new Error("expected list item to resolve to a shape")
            }
          }
          //case c: UnknownTrail => parent
          case _ => throw new Error("did not expect a non-list-item path relative to a list")
        }
      }
    }
  }


  def resolveParameterToShape(shapesState: ShapesState, shapeId: ShapeId, shapeParameterId: ShapeParameterId, bindings: ParameterBindings): Option[ShapeEntity] = {
    val flattenedShape = shapesState.flattenedShape(shapeId)
    val binding = bindings.getOrElse(shapeParameterId, flattenedShape.bindings /*.get*/ (shapeParameterId))
    val itemShape: Option[ShapeEntity] = binding match {
      case Some(value) => value match {
        case ParameterProvider(shapeParameterId) => {
          resolveParameterToShape(shapesState, shapeId, shapeParameterId, bindings)
        }
        case ShapeProvider(shapeId) => Some(shapesState.shapes(shapeId))
        case NoProvider() => None
      }
      case None => None
    }
    itemShape
  }

  def resolveBaseObject(objectId: ShapeId)(implicit shapesState: ShapesState): ShapeEntity = {
    val o = shapesState.shapes(objectId)
    if (o.descriptor.baseShapeId == ObjectKind.baseShapeId) {
      o
    } else {
      resolveBaseObject(o.descriptor.baseShapeId)
    }
  }

  def isCoreShape(b: ShapeId) = ShapesHelper.allCoreShapes.exists(_.baseShapeId == b)

  def resolveToBaseShape(shapeId: ShapeId)(implicit shapesState: ShapesState): ShapeEntity = {
    val o = shapesState.shapes(shapeId)

    if (isCoreShape(o.descriptor.baseShapeId)) {
      o
    } else {
      resolveBaseObject(o.descriptor.baseShapeId)
    }
  }

  def resolveToBaseShapeId(shapeId: ShapeId)(implicit shapesState: ShapesState): ShapeId = {
    resolveToBaseShape(shapeId).shapeId
  }


  def resolveFieldToShapeEntity(shapesState: ShapesState, fieldId: FieldId, bindings: ParameterBindings) = {
    val flattenedField = shapesState.flattenedField(fieldId)
    val resolvedShape = flattenedField.fieldShapeDescriptor match {
      case fsd: Commands.FieldShapeFromShape => {
        Some(shapesState.shapes(fsd.shapeId))
      }
      case fsd: Commands.FieldShapeFromParameter => {
        flattenedField.bindings(fsd.shapeParameterId) match {
          case Some(value) => value match {
            case p: ParameterProvider => {
              None
            }
            case p: ShapeProvider => Some(shapesState.shapes(p.shapeId))
            case p: NoProvider => None
          }
          case None => None
        }
      }
    }
    (flattenedField, resolvedShape)
  }

  def resolveFieldToShape(shapesState: ShapesState, fieldId: FieldId, bindings: ParameterBindings): Option[ResolvedTrail] = {
    val (flattenedField, resolvedShape) = resolveFieldToShapeEntity(shapesState, fieldId, bindings)
    resolvedShape match {
      case Some(shapeEntity) => Some(ResolvedTrail(shapeEntity, toCoreShape(shapeEntity, shapesState), flattenedField.bindings))
      case None => None
    }
  }

  def tryResolveFieldFromKey(shapesState: ShapesState, parentObject: ShapeEntity, key: String): Option[FieldId] = {
    parentObject.descriptor.fieldOrdering.find(fieldId => shapesState.fields(fieldId).descriptor.name == key)
  }

  def tryResolveJson(interactionTrail: InteractionTrail, jsonTrail: JsonTrail, interaction: HttpInteraction): Option[Json] = {
    tryResolveJsonLike(interactionTrail, jsonTrail, interaction).map(_.asJson)
  }

  def tryResolveJsonLike(interactionTrail: InteractionTrail, jsonTrail: JsonTrail, interaction: HttpInteraction): Option[JsonLike] = {
    interactionTrail.path.last match {
      case t: ResponseBody => {
        tryResolveJsonTrail(jsonTrail, BodyUtilities.parseBody(interaction.response.body))
      }
      case t: RequestBody => {
        tryResolveJsonTrail(jsonTrail, BodyUtilities.parseBody(interaction.request.body))
      }
      case _ => throw new Error("expected interaction trail to be either a request body or response body")
    }
  }

  def tryResolveJsonTrail(jsonTrail: JsonTrail, jsonOption: Option[JsonLike]): Option[JsonLike] = {
    if (jsonOption.isEmpty) {
      return None
    }

    if (jsonTrail.path.isEmpty) {
      return jsonOption
    }

    val json = jsonOption.get

    jsonTrail.path.head match {
      case JsonObject() => tryResolveJsonTrail(jsonTrail.withoutParent(), jsonOption)
      case JsonArray() => tryResolveJsonTrail(jsonTrail.withoutParent(), jsonOption)
      case JsonObjectKey(key) => {
        if (json.isObject) {
          tryResolveJsonTrail(jsonTrail.withoutParent(), json.fields.get(key))
        } else {
          None
        }
      }
      case JsonArrayItem(index) => {
        if (json.isArray) {
          val array = json.items
          val item = array.lift(index)
          tryResolveJsonTrail(jsonTrail.withoutParent(), item)
        } else {
          None
        }
      }
    }
  }

  def jsonToCoreKind(jsonLike: JsonLike): CoreShapeKind = {
    jsonLike match {
      case a if a.isArray => ListKind
      case a if a.isObject => ObjectKind
      case a if a.isString => StringKind
      case a if a.isNumber => NumberKind
      case a if a.isBoolean => BooleanKind
      case a if a.isNull => NullableKind
    }

  }
}

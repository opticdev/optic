package com.useoptic.diff.shapes

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.contexts.shapes._
import com.useoptic.contexts.shapes.Commands._
import com.useoptic.contexts.shapes.ShapesHelper._
import com.useoptic.diff.interactions.{BodyUtilities, InteractionTrail, RequestBody, RequestSpecTrail, RequestSpecTrailHelpers, ResponseBody}
import com.useoptic.diff.shapes.JsonTrailPathComponent._
import com.useoptic.types.capture.{HttpInteraction, JsonLike}
import io.circe.Json


object Resolvers {
  case class ResolvedTrail(shapeEntity: ShapeEntity, coreShapeKind: CoreShapeKind, bindings: ParameterBindings)
  type ParameterBindings = Map[ShapeParameterId, Option[ProviderDescriptor]]

  def resolveTrailToCoreShape(spec: RfcState, trail: ShapeTrail): ResolvedTrail = {
    val rootShape = spec.shapesState.shapes(trail.rootShapeId)
    //@GOTCHA: might need to resolve rootShape to its lowest baseShapeId
    val rootShapeCoreShape = toCoreShape(rootShape, spec.shapesState)
    var resolved: ResolvedTrail = ResolvedTrail(rootShape, rootShapeCoreShape, Map.empty)
    for (pathComponent <- trail.path) {
      resolved = resolveTrailPath(spec.shapesState, resolved, pathComponent)
    }
    resolved
  }

  def resolveTrailPath(shapesState: ShapesState, parent: ResolvedTrail, pathComponent: ShapeTrailPathComponent): ResolvedTrail = {
    parent.coreShapeKind match {
      case NullableKind => {
        pathComponent match {
          case c: NullableTrail => {
            val (shapeId, coreShapeKind) = toCoreAndBaseShape(shapesState.shapes(c.innerShapeId), shapesState)
            ResolvedTrail(shapesState.shapes(shapeId), coreShapeKind, parent.bindings)
          }
          case _ => throw new Error("did not expect a non-nullable path relative to a NullableKind")
        }
      }
      case OptionalKind => {
        pathComponent match {
          case c: OptionalTrail => {
            val (shapeId, coreShapeKind) = toCoreAndBaseShape(shapesState.shapes(c.innerShapeId), shapesState)
            ResolvedTrail(shapesState.shapes(shapeId), coreShapeKind, parent.bindings)
          }
          case _ => throw new Error("did not expect a non-optional path relative to a OptionalKind")
        }
      }
      case OneOfKind => {
        pathComponent match {
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
          case _ => throw new Error("did not expect a non-list-item path relative to a list")
        }
      }
    }
  }

  def resolveParameterToShape(shapesState: ShapesState, shapeId: ShapeId, shapeParameterId: ShapeParameterId, bindings: ParameterBindings): Option[ShapeEntity] = {
    val flattenedShape = shapesState.flattenedShape(shapeId)
    val binding = bindings.getOrElse(shapeParameterId, flattenedShape.bindings(shapeParameterId))
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

  def resolveFieldToShape(shapesState: ShapesState, fieldId: FieldId, bindings: ParameterBindings): Option[ResolvedTrail] = {
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
}

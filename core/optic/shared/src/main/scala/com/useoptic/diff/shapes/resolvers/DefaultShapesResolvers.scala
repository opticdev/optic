package com.useoptic.diff.shapes.resolvers

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.contexts.shapes.Commands._
import com.useoptic.contexts.shapes._
import com.useoptic.contexts.shapes.ShapesHelper._
import com.useoptic.diff.shapes._
import com.useoptic.diff.shapes.resolvers.ShapesResolvers._

class DefaultShapesResolvers(spec: RfcState) extends ShapesResolvers {
  val resolveTrailToCoreShape: (ShapeTrail, ParameterBindings) => ResolvedTrail = (trail: ShapeTrail, bindings: ParameterBindings) => {
    val rootShape = spec.shapesState.shapes(trail.rootShapeId)
    //@GOTCHA: might need to resolve rootShape to its lowest baseShapeId
    val rootShapeCoreShape = toCoreShape(rootShape, spec.shapesState)
    println("bbb")
    println(bindings)
    var resolved: ResolvedTrail = ResolvedTrail(rootShape, rootShapeCoreShape, bindings)
    for (pathComponent <- trail.path) {
      resolved = resolveTrailPath(resolved, pathComponent)
    }
    resolved
  }


  val resolveTrailToCoreShapeFromParent: (ResolvedTrail, Seq[ShapeTrailPathComponent]) => ResolvedTrail = (parent: ResolvedTrail, childTrail: Seq[ShapeTrailPathComponent]) => {
    var resolved = parent
    for (pathComponent <- childTrail) {
      resolved = resolveTrailPath(resolved, pathComponent)
    }
    resolved
  }

  val flattenChoice: (ShapeTrail, Seq[ShapeTrailPathComponent], ParameterBindings) => Seq[ChoiceOutput] = (parentTrail: ShapeTrail, additionalComponents: Seq[ShapeTrailPathComponent], bindings: ParameterBindings) => {
    val choices = listTrailChoices(parentTrail.withChildren(additionalComponents: _*), bindings)
    choices
  }

  val listTrailChoices: (ShapeTrail, ParameterBindings) => Seq[ChoiceOutput] = (trail: ShapeTrail, bindings: ParameterBindings) => {
    val resolved = resolveTrailToCoreShape(trail, bindings)
    resolved.coreShapeKind match {
      case UnknownKind => {
        Seq(
          //ChoiceOutput(trail, Seq(UnknownTrail(), resolved.shapeEntity.shapeId, resolved.coreShapeKind)
        )
      }
      case NullableKind => {
        val itemShape = resolveParameterToShape(resolved.shapeEntity.shapeId, NullableKind.innerParam, resolved.bindings).get
        Seq(ChoiceOutput(trail, Seq(NullableTrail()), resolved.shapeEntity.shapeId, resolved.coreShapeKind, resolved.bindings)) ++ flattenChoice(trail, Seq(NullableTrail(), NullableItemTrail(itemShape.shapeId)), bindings)
      }
      case OptionalKind => {
        val itemShape = resolveParameterToShape(resolved.shapeEntity.shapeId, OptionalKind.innerParam, resolved.bindings).get
        Seq(
          ChoiceOutput(trail, Seq(OptionalTrail()), resolved.shapeEntity.shapeId, resolved.coreShapeKind, resolved.bindings),
        ) ++ flattenChoice(trail, Seq(OptionalTrail(), OptionalItemTrail(itemShape.shapeId)), bindings)
      }
      case OneOfKind => {
        val shapeParameterIds = resolved.shapeEntity.descriptor.parameters match {
          case DynamicParameterList(shapeParameterIds) => shapeParameterIds
          case _ => Seq.empty
        }
        val oneOfShapeId = resolved.shapeEntity.shapeId
        shapeParameterIds.flatMap(shapeParameterId => {
          val itemShape = resolveParameterToShape(oneOfShapeId, shapeParameterId, resolved.bindings).get

          flattenChoice(trail, Seq(OneOfTrail(oneOfShapeId), OneOfItemTrail(oneOfShapeId, shapeParameterId, itemShape.shapeId)), bindings)
        })
      }
      case _ => Seq(
        ChoiceOutput(trail, Seq.empty, resolved.shapeEntity.shapeId, resolved.coreShapeKind, resolved.bindings)
      )
    }
  }

  val resolveTrailPath: (ResolvedTrail, ShapeTrailPathComponent) => ResolvedTrail = (parent: ResolvedTrail, pathComponent: ShapeTrailPathComponent) => {
    val shapesState = spec.shapesState
    println("ccc")
    println(parent.coreShapeKind, parent.shapeEntity.shapeId)
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
            resolveFieldToShape(c.fieldId, parent.bindings) match {
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
            resolveParameterToShape(c.listShapeId, ListKind.innerParam, parent.bindings) match {
              case Some(value) => {
                val (shapeId, coreShapeKind) = toCoreAndBaseShape(value, shapesState)
                ResolvedTrail(shapesState.shapes(shapeId), coreShapeKind, Map(ListKind.innerParam -> shapesState.bindingsByShapeId.getOrElse(shapeId, Map.empty).get(ListKind.innerParam)))
              }
              case None => throw new Error("expected list item to resolve to a shape")
            }
          }
          //case c: UnknownTrail => parent
          case _ => throw new Error("did not expect a non-list-item path relative to a list")
        }
      }
      case k => {
        parent
      }
    }
  }


  val resolveParameterToShape: (ShapeId, ShapeParameterId, ParameterBindings) => Option[ShapeEntity] = (shapeId: ShapeId, shapeParameterId: ShapeParameterId, bindings: ParameterBindings) => {
    val shapesState = spec.shapesState
    val flattenedShape = shapesState.flattenedShape(shapeId)
    val binding = bindings.getOrElse(shapeParameterId, flattenedShape.bindings /*.get*/ (shapeParameterId))
    val itemShape: Option[ShapeEntity] = binding match {
      case Some(value) => value match {
        case ParameterProvider(shapeParameterId) => {
          resolveParameterToShape(shapeId, shapeParameterId, bindings)
        }
        case ShapeProvider(shapeId) => Some(shapesState.shapes(shapeId))
        case NoProvider() => None
      }
      case None => None
    }
    itemShape
  }

  val resolveBaseObject: ShapeId => ShapeEntity = (objectId: ShapeId) => {
    val shapesState = spec.shapesState
    val o = shapesState.shapes(objectId)
    if (o.descriptor.baseShapeId == ObjectKind.baseShapeId) {
      o
    } else {
      resolveBaseObject(o.descriptor.baseShapeId)
    }
  }

  def isCoreShape(b: ShapeId) = ShapesHelper.allCoreShapes.exists(_.baseShapeId == b)

  val resolveToBaseShape: ShapeId => ShapeEntity = (shapeId: ShapeId) => {
    val shapesState = spec.shapesState
    val o = shapesState.shapes(shapeId)

    if (isCoreShape(o.descriptor.baseShapeId)) {
      o
    } else {
      resolveBaseObject(o.descriptor.baseShapeId)
    }
  }

  val resolveToBaseShapeId: ShapeId => ShapeId = (shapeId: ShapeId) => {
    resolveToBaseShape(shapeId).shapeId
  }


  val resolveFieldToShapeEntity: (FieldId, ParameterBindings) => (FlattenedField, Option[ShapeEntity]) = (fieldId: FieldId, bindings: ParameterBindings) => {
    val shapesState = spec.shapesState
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

  val resolveFieldToShape: (FieldId, ParameterBindings) => Option[ResolvedTrail] = (fieldId: FieldId, bindings: ParameterBindings) => {
    val shapesState = spec.shapesState
    val (flattenedField, resolvedShape) = resolveFieldToShapeEntity(fieldId, bindings)
    resolvedShape match {
      case Some(shapeEntity) => Some(ResolvedTrail(shapeEntity, toCoreShape(shapeEntity, shapesState), flattenedField.bindings))
      case None => None
    }
  }

  val tryResolveFieldFromKey: (ShapeEntity, String) => Option[FieldId] = (parentObject: ShapeEntity, key: String) => {
    val shapesState = spec.shapesState
    parentObject.descriptor.fieldOrdering.find(fieldId => shapesState.fields(fieldId).descriptor.name == key)
  }
}

package com.useoptic.contexts.shapes.projections

import com.useoptic.contexts.shapes.Commands._
import com.useoptic.contexts.shapes.ShapesHelper._
import com.useoptic.contexts.shapes._
import com.useoptic.diff.ChangeType.ChangeType
import com.useoptic.diff.interactions.ShapeRelatedDiff
import com.useoptic.diff.shapes.resolvers.ShapesResolvers
import com.useoptic.diff.shapes._

import scala.collection.mutable

// this is not a projection. it is a query
class FlatShapeQueries(resolvers: ShapesResolvers, nameForShapeId: NameForShapeId, shapesState: ShapesState) {
  private val returnAny = (AnyKind.baseShapeId, FlatShape(AnyKind.baseShapeId, Seq(ColoredComponent("Any", "primitive", primitiveId = Some(AnyKind.baseShapeId))), Seq.empty, "$any", false, Map.empty, None, Seq.empty))

  def forShapeId(shapeId: ShapeId, fieldIdOption: Option[String] = None, trailTags: TrailTags[ShapeTrail] = TrailTags(Map.empty), shapeRelatedDiffs: Seq[ShapeRelatedDiff] = Seq.empty)(implicit expandedName: Boolean = true, revision: Int = 0): FlatShapeResult = {
    implicit val parametersByShapeId: mutable.Map[String, FlatShape] = scala.collection.mutable.HashMap[String, FlatShape]()
    val root = getFlatShape(shapeId, ShapeTrail(shapeId, Seq.empty))(fieldIdOption, expandedName, parametersByShapeId, trailTags, shapeRelatedDiffs)
    FlatShapeResult(root, parametersByShapeId.toMap, Vector(), s"${shapeId}_${revision.toString}")
  }

  private def addLinkToParameter(shapeId: ShapeId, shape: FlatShape)(implicit fieldIdOption: Option[String] = None, parametersByShapeId: mutable.Map[String, FlatShape]): Unit = {
    if (!parametersByShapeId.contains(shapeId)) {
      parametersByShapeId.put(shapeId, shape)
    }
  }

  private def getFlatShape(shapeId: ShapeId, path: ShapeTrail)(implicit fieldIdOption: Option[String], expandedName: Boolean = false, parametersByShapeId: mutable.Map[String, FlatShape], trailTags: TrailTags[ShapeTrail], shapeRelatedDiffs: Seq[ShapeRelatedDiff]): FlatShape = {
    val shape = shapesState.flattenedShape(shapeId)

    def resolveInner(paramId: String, pathNew: ShapeId => Seq[ShapeTrailPathComponent]) = resolvers.resolveParameterToShape(shapeId, paramId, {
      if (fieldIdOption.isDefined) {
        shapesState.flattenedField(fieldIdOption.get).bindings
      } else {
        shapesState.flattenedShape(shapeId).bindings
      }
    })
      .map(i => {
        val newPath = path.withChildren(pathNew(i.shapeId): _*)
        (i.shapeId, getFlatShape(i.shapeId, newPath)(None, false, parametersByShapeId, trailTags, shapeRelatedDiffs))
      })
      .getOrElse(returnAny)

    def tagForCurrent(p: ShapeTrail = path): Option[ChangeType] = trailTags.trails.filterKeys(i => i.path == p).values.headOption

    def shapeDiffsForCurrent(p: ShapeTrail = path): Seq[ShapeRelatedDiff] = {
      shapeRelatedDiffs.filter(i => i.shapeDiffResult.shapeTrail.path == p)
    }

    def returnWith(typeName: Seq[ColoredComponent], fields: Seq[FlatField] = Seq(), canName: Boolean = false, links: Map[String, ShapeId]): FlatShape = {

      FlatShape(shape.coreShapeId, typeName, fields, shapeId, canName, links, tagForCurrent(), shapeDiffsForCurrent())
    }

    shape.coreShapeId match {
      case ListKind.baseShapeId => {
        val (innerShapeId, flatShape) = resolveInner("$listItem", id => Seq(ListTrail(shapeId), ListItemTrail(shapeId, id)))
        addLinkToParameter(innerShapeId, flatShape)
        returnWith(nameForShapeId.getShapeName(shapeId, expand = expandedName), links = Map("$listItem" -> innerShapeId))
      }
      case MapKind.baseShapeId => {
        val (keyInnerShapeId, keyFlatShape) = resolveInner("$mapKey", (id) => Seq.empty[ShapeTrailPathComponent])
        addLinkToParameter(keyInnerShapeId, keyFlatShape)

        val (valueInnerShapeId, valueFlatShape) = resolveInner("$mapValue", (id) => Seq.empty[ShapeTrailPathComponent])
        addLinkToParameter(valueInnerShapeId, valueFlatShape)

        returnWith(nameForShapeId.getShapeName(shapeId, expand = expandedName), links = Map("$mapKey" -> keyInnerShapeId, "$mapValue" -> valueInnerShapeId))
      }
      case OneOfKind.baseShapeId => {
        val inners = shapesState.shapes(shapeId).descriptor.parameters match {
          case DynamicParameterList(shapeParameterIds) => shapeParameterIds
        }

        val innersWithShape = inners.map(i => resolveInner(i, (id) => Seq(OneOfTrail(shapeId), OneOfItemTrail(shapeId, i, id))))

        innersWithShape.foreach {
          case (innerId, innerFlatShape) => {
            addLinkToParameter(innerId, innerFlatShape)
          }
        }

        val innerLinks = innersWithShape.map(_._1).zipWithIndex.map { case (innerId, index) => index.toString -> innerId }.toMap

        returnWith(nameForShapeId.getShapeName(shapeId, expand = expandedName), links = innerLinks)
      }
      case NullableKind.baseShapeId => {
        val (innerShapeId, flatShape) = resolveInner("$nullableInner", (id) => Seq.empty[ShapeTrailPathComponent])
        addLinkToParameter(innerShapeId, flatShape)
        returnWith(nameForShapeId.getShapeName(shapeId, expand = expandedName), links = Map("$nullableInner" -> innerShapeId))
      }
      case OptionalKind.baseShapeId => {
        val (innerShapeId, flatShape) = resolveInner(OptionalKind.innerParam, (id) => Seq.empty[ShapeTrailPathComponent])
        addLinkToParameter(innerShapeId, flatShape)
        returnWith(nameForShapeId.getShapeName(shapeId, expand = expandedName), links = Map(OptionalKind.innerParam -> innerShapeId))
      }
      case ReferenceKind.baseShapeId => {
        val (innerShapeId, flatShape) = resolveInner("$referenceInner", (id) => Seq.empty[ShapeTrailPathComponent])
        addLinkToParameter(innerShapeId, flatShape)
        returnWith(nameForShapeId.getShapeName(shapeId, expand = expandedName), links = Map("$referenceInner" -> innerShapeId))
      }
      case IdentifierKind.baseShapeId => {
        val (innerShapeId, flatShape) = resolveInner("$identifierInner", (id) => Seq.empty[ShapeTrailPathComponent])
        addLinkToParameter(innerShapeId, flatShape)
        returnWith(nameForShapeId.getShapeName(shapeId, expand = expandedName), links = Map("$identifierInner" -> innerShapeId))
      }
      case ObjectKind.baseShapeId => {
        val baseObject = resolvers.resolveBaseObject(shapeId)
        val fields = baseObject.descriptor.fieldOrdering.flatMap(fieldId => {
          val field = shapesState.fields(fieldId)
          if (field.isRemoved) {
            None
          } else {
            val fieldShapeId = field.descriptor.shapeDescriptor.asInstanceOf[FieldShapeFromShape].shapeId
            val fieldPath = path.withChildren(ObjectTrail(baseObject.shapeId), ObjectFieldTrail(field.fieldId, fieldShapeId))
            Some(FlatField(field.descriptor.name, getFlatShape(fieldShapeId, fieldPath)(Some(fieldId), false, parametersByShapeId, trailTags, shapeRelatedDiffs), fieldId, tagForCurrent(fieldPath), shapeDiffsForCurrent(fieldPath)))
          }

        }).sortBy(_.fieldName)

        val canName = baseObject.descriptor.name == ""

        //handle generics
        //        val genericParams = Try(baseObject.descriptor.parameters.asInstanceOf
        //          [DynamicParameterList].shapeParameterIds).getOrElse(Seq.empty)
        //
        //        val generics = genericParams.flatMap(param => {
        //          val seq = resolveInner(param)
        //          Seq(ColoredComponent(param.split(":").last+":", "text", None)) ++ seq
        //        })

        FlatShape(baseObject.descriptor.baseShapeId, nameForShapeId.getShapeName(baseObject.shapeId), fields, baseObject.shapeId, canName, Map.empty, tagForCurrent(), shapeDiffsForCurrent())
      }
      //fallback to primitives
      case baseShapeId if ShapesHelper.allCoreShapes.exists(_.baseShapeId == baseShapeId) =>
        returnWith(nameForShapeId.getShapeName(shapeId, expand = expandedName), links = Map.empty)
      //fallback for unhandled -- should never be reached
      case _ => returnAny._2
    }
  }

}

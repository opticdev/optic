package com.useoptic.diff.shapes

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.contexts.shapes.Commands._
import com.useoptic.contexts.shapes.ShapesHelper._
import com.useoptic.diff.shapes.resolvers.ShapesResolvers
import com.useoptic.diff.shapes.resolvers.ShapesResolvers.ResolvedTrail

import scala.util.Try

class ShapeTraverser(resolvers: ShapesResolvers, spec: RfcState, visitors: ShapeVisitors) {

  def traverse(shapeId: ShapeId, shapeTrail: ShapeTrail): Unit = {
    val shapeEntityOption = Try(spec.shapesState.flattenedShape(shapeId)).toOption
    println(shapeEntityOption)

    if (shapeEntityOption.isDefined) {
      val shapeEntity = shapeEntityOption.get
      val resolved = resolvers.resolveTrailToCoreShape(shapeTrail, Map.empty) //@TODO: check bindings
      shapeEntity.coreShapeId match {
        case ObjectKind.baseShapeId => {
          val baseObject = resolvers.resolveBaseObject(shapeId)
          visitors.objectVisitor.begin(ResolvedTrail(baseObject, ObjectKind, resolved.bindings), shapeTrail, None)
          val fieldNameToId = baseObject.descriptor.fieldOrdering
            .map(fieldId => {
              val field = spec.shapesState.fields(fieldId)
              //@GOTCHA need field bindings?
              val fieldTrail = resolvers.resolveFieldToShape(fieldId, resolved.bindings).get
              (field.descriptor.name -> (fieldId, fieldTrail))
            }).toMap
          fieldNameToId.map {
            case (key, (id, fieldTrail)) => {
              val fieldShapeTrail = shapeTrail.withChild(ObjectFieldTrail(id, fieldTrail.shapeEntity.shapeId))
              //visit field
              visitors.objectVisitor.visit(key, id, fieldTrail, fieldShapeTrail)
              //traverse field shape
              traverse(fieldTrail.shapeEntity.shapeId, fieldShapeTrail)
            }
          }
        }
        case ListKind.baseShapeId => {
          val listShape = resolved.shapeEntity
          val resolvedItem = {
            resolvers.resolveParameterToShape(listShape.shapeId, ListKind.innerParam, resolved.bindings)
              .map(i => resolvers.resolveToBaseShape(i.shapeId))
          }
          assert(resolvedItem.isDefined, "We expect all lists to have a parameter for list item")
          visitors.listVisitor.begin(shapeTrail, listShape, resolvedItem.get)
          val itemTrail = shapeTrail.withChild(ListItemTrail(listShape.shapeId, resolvedItem.get.shapeId))
          val coreShape = resolvers.resolveTrailToCoreShape(itemTrail, Map.empty) //@TODO: check bindings
          visitors.primitiveVisitor.visit(coreShape, itemTrail)
          traverse(resolvedItem.get.shapeId, itemTrail)
        }
        case OneOfKind.baseShapeId => {
          val oneOfShape = resolved.shapeEntity
          // there's only a diff if none of the shapes match
          val shapeParameterIds = resolved.shapeEntity.descriptor.parameters match {
            case DynamicParameterList(shapeParameterIds) => shapeParameterIds
            case _ => Seq()
          }

          val branchShapes = shapeParameterIds.flatMap(paramId =>
            resolvers.resolveParameterToShape(oneOfShape.shapeId, paramId, resolved.bindings))
            .map(i => resolvers.resolveToBaseShape(i.shapeId))

          visitors.oneOfVisitor.begin(shapeTrail, oneOfShape, branchShapes.map(i => {
            resolvers.resolveToBaseShape(i.shapeId).shapeId
          }))
          branchShapes.zipWithIndex.foreach((item) => {
            val (i, index) = item
            val branch = resolvers.resolveToBaseShape(i.shapeId)
            val branchShapeTrail = shapeTrail.withChild(OneOfItemTrail(oneOfShape.shapeId, shapeParameterIds.apply(index), branch.shapeId))
            visitors.oneOfVisitor.visit(branchShapeTrail, oneOfShape, branch)
            traverse(branch.shapeId, branchShapeTrail)
          })
        }
        case OptionalKind.baseShapeId => {
          val optionalShape = resolved.shapeEntity
          val innerShapeOption = resolvers.resolveParameterToShape(resolved.shapeEntity.shapeId, OptionalKind.innerParam, resolved.bindings)
            .map(i => resolvers.resolveToBaseShape(i.shapeId))

          visitors.optionalVisitor.begin(shapeTrail, optionalShape, innerShapeOption)
          innerShapeOption.foreach(innerShape => traverse(innerShape.shapeId, shapeTrail.withChild(OptionalItemTrail(innerShape.shapeId))))
        }
        case NullableKind.baseShapeId => {
          val nullableShape = resolved.shapeEntity
          val innerShapeOption = resolvers.resolveParameterToShape(resolved.shapeEntity.shapeId, NullableKind.innerParam, resolved.bindings)
            .map(i => resolvers.resolveToBaseShape(i.shapeId))

          visitors.nullableVisitor.begin(shapeTrail, nullableShape, innerShapeOption)
          innerShapeOption.foreach(innerShape => traverse(innerShape.shapeId, shapeTrail.withChild(NullableItemTrail(innerShape.shapeId))))
        }
        case _ => {
          visitors.primitiveVisitor.visit(resolved, shapeTrail)
        }
      }
    }
  }
}

package com.useoptic.diff.shapes

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.contexts.shapes.Commands.ShapeId
import com.useoptic.contexts.shapes.ShapeEntity
import com.useoptic.contexts.shapes.ShapesHelper.{CoreShapeKind, ListKind, ObjectKind}
import com.useoptic.diff.shapes.Resolvers.{ParameterBindings, ResolvedTrail}
import com.useoptic.types.capture.JsonLike

import scala.util.Try

class ShapeTraverser(spec: RfcState, visitors: ShapeVisitors) {
  val shapesState = spec.shapesState

  def traverse(shapeId: ShapeId, shapeTrail: ShapeTrail): Unit = {
    val shapeEntityOption = Try(spec.shapesState.flattenedShape(shapeId)).toOption

    if (shapeEntityOption.isDefined) {
      val shapeEntity = shapeEntityOption.get

      shapeEntity.coreShapeId match {
        case ObjectKind.baseShapeId => {
          val resolved = Resolvers.resolveTrailToCoreShape(spec, shapeTrail)
          val baseObject = Resolvers.resolveBaseObject(shapeId)(shapesState)
          visitors.objectVisitor.begin(ResolvedTrail(baseObject, ObjectKind, resolved.bindings), shapeTrail, None)
          val fieldNameToId = baseObject.descriptor.fieldOrdering
            .map(fieldId => {
              val field = spec.shapesState.fields(fieldId)
              //@GOTCHA need field bindings?
              val fieldTrail = Resolvers.resolveFieldToShape(spec.shapesState, fieldId, resolved.bindings).get
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
          val resolved = Resolvers.resolveTrailToCoreShape(spec, shapeTrail)
          val listShape = resolved.shapeEntity
          val resolvedItem = Resolvers.resolveParameterToShape(spec.shapesState, listShape.shapeId, ListKind.innerParam, resolved.bindings)
          assert(resolvedItem.isDefined, "We expect all lists to have a parameter for list item")
          visitors.listVisitor.begin(shapeTrail, listShape, resolvedItem.get)
          val itemTrail = shapeTrail.withChild(ListItemTrail(listShape.shapeId, resolvedItem.get.shapeId))
          visitors.primitiveVisitor.visit(Resolvers.resolveTrailToCoreShape(spec, itemTrail), itemTrail)
        }
        case _ => {
          val resolved = Resolvers.resolveTrailToCoreShape(spec, shapeTrail)
          visitors.primitiveVisitor.visit(resolved, shapeTrail)
        }
      }


    }
  }
}

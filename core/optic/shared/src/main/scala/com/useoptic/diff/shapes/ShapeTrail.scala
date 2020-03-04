package com.useoptic.diff.shapes

import com.useoptic.contexts.shapes.Commands.{FieldId, ShapeId}

sealed trait ShapeTrailPathComponent

case class ObjectTrail(shapeId: ShapeId) extends ShapeTrailPathComponent

case class ObjectFieldTrail(fieldId: FieldId, fieldShapeId: ShapeId) extends ShapeTrailPathComponent

case class ListTrail(shapeId: ShapeId) extends ShapeTrailPathComponent

case class ListItemTrail(listShapeId: ShapeId, itemShapeId: ShapeId) extends ShapeTrailPathComponent

case class OneOfTrail(shapeId: ShapeId) extends ShapeTrailPathComponent
case class OneOfItemTrail(oneOfId: ShapeId, itemShapeId: ShapeId) extends ShapeTrailPathComponent

case class ShapeTrail(rootShapeId: ShapeId, path: Seq[ShapeTrailPathComponent]) {
  def withChild(pc: ShapeTrailPathComponent) = {
    this.copy(path = path :+ pc)
  }

  def withChildren(pc: ShapeTrailPathComponent*) = {
    this.copy(path = path ++ pc)
  }

  def lastField(): Option[FieldId] = {
    path.lastOption match {
      case Some(pathComponent) => {
        pathComponent match {
          case pc: ObjectFieldTrail => Some(pc.fieldId)
          case _ => None
        }
      }
      case None => None
    }
  }

  def lastObject(): Option[ShapeId] = {
    path.lastOption match {
      case Some(pathComponent) => {
        pathComponent match {
          case ObjectTrail(shapeId) => Some(shapeId)
          case _ => None
        }
      }
      case None => Some(rootShapeId)
    }
  }
}

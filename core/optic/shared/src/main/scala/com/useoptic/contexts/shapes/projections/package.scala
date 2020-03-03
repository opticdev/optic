package com.useoptic.contexts.shapes

import com.useoptic.contexts.shapes.Commands.{FieldId, ShapeId}
import com.useoptic.contexts.shapes.projections.NameForShapeId.ColoredComponent
import com.useoptic.diff.ChangeType.ChangeType

import scala.scalajs.js.annotation.JSExportAll

package object projections {
  case class TrailTags[A](trails: Map[A, ChangeType])

  object TrailTags {
    def empty[A] = TrailTags[A](Map.empty)
  }

  @JSExportAll
  case class FlatField(fieldName: String, shape: FlatShape, fieldId: FieldId, tag: Option[ChangeType])
  @JSExportAll
  case class FlatShape(baseShapeId: ShapeId, typeName: Seq[ColoredComponent], fields: Seq[FlatField], id: ShapeId, canName: Boolean, links: Map[String, ShapeId], tag: Option[ChangeType]) {
    def joinedTypeName = typeName.map(_.name).mkString(" ")
  }
  @JSExportAll
  case class FlatShapeResult(root: FlatShape, parameterMap: Map[String, FlatShape], pathsForAffectedIds: Vector[Seq[String]], renderId: String)
}

package com.useoptic.contexts.shapes

import com.useoptic.contexts.shapes.Commands.{FieldId, ShapeId}
import com.useoptic.diff.ChangeType.ChangeType
import com.useoptic.diff.interactions.ShapeRelatedDiff

import scala.scalajs.js.annotation.JSExportAll

package object projections {
  case class TrailTags[A](trails: Map[A, ChangeType])

  object TrailTags {
    def empty[A]: TrailTags[A] = TrailTags[A](Map.empty)
  }

  @JSExportAll
  case class FlatField(fieldName: String, shape: FlatShape, fieldId: FieldId, tag: Option[ChangeType], diffs: Seq[ShapeRelatedDiff]) {
    def diffCount: Int = diffs.size + shape.diffCount
  }
  @JSExportAll
  case class FlatShape(baseShapeId: ShapeId, typeName: Seq[ColoredComponent], fields: Seq[FlatField], id: ShapeId, canName: Boolean, links: Map[String, ShapeId], tag: Option[ChangeType], diffs: Seq[ShapeRelatedDiff]) {
    def joinedTypeName = typeName.map(_.name).mkString(" ")
    def diffCount: Int = diffs.size
  }
  @JSExportAll
  case class FlatShapeResult(root: FlatShape, parameterMap: Map[String, FlatShape], pathsForAffectedIds: Vector[Seq[String]], renderId: String)
}

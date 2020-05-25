package com.useoptic.diff.shapes.resolvers

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.contexts.shapes.Commands._
import com.useoptic.contexts.shapes._
import com.useoptic.contexts.shapes.ShapesHelper.CoreShapeKind
import com.useoptic.diff.shapes.resolvers.ShapesResolvers._
import com.useoptic.diff.shapes._

import scala.scalajs.js.annotation.{JSExportAll, JSExportTopLevel}

@JSExportTopLevel("ShapesResolvers")
@JSExportAll
object ShapesResolvers {

  case class ChoiceOutput(parentTrail: ShapeTrail, additionalComponents: Seq[ShapeTrailPathComponent], shapeId: ShapeId, coreShapeKind: CoreShapeKind, bindings: ParameterBindings) {
    def shapeTrail(): ShapeTrail = parentTrail.withChildren(additionalComponents: _*)
  }

  case class ResolvedTrail(shapeEntity: ShapeEntity, coreShapeKind: CoreShapeKind, bindings: ParameterBindings)

  type ParameterBindings = Map[ShapeParameterId, Option[ProviderDescriptor]]

  def newResolver(rfcState: RfcState) = new DefaultShapesResolvers(rfcState)

  def newCachingResolver(rfcState: RfcState) = new CachingShapesResolvers(newResolver(rfcState))
}

trait ShapesResolvers {

  def resolveTrailToCoreShape: (ShapeTrail, ParameterBindings) => ResolvedTrail

  def resolveTrailToCoreShapeFromParent: (ResolvedTrail, Seq[ShapeTrailPathComponent]) => ResolvedTrail

  def getField: FieldId => FieldEntity

  def flattenChoice: (ShapeTrail, Seq[ShapeTrailPathComponent], ParameterBindings) => Seq[ChoiceOutput]

  def listTrailChoices: (ShapeTrail, ParameterBindings) => Seq[ChoiceOutput]

  def resolveTrailPath: (ResolvedTrail, ShapeTrailPathComponent) => ResolvedTrail

  def resolveParameterToShape: (ShapeId, ShapeParameterId, ParameterBindings) => Option[ShapeEntity]

  def resolveBaseObject: ShapeId => ShapeEntity

  def resolveToBaseShape: ShapeId => ShapeEntity

  def resolveToBaseShapeId: ShapeId => ShapeId

  def resolveFieldToShapeEntity: (FieldId, ParameterBindings) => (FlattenedField, Option[ShapeEntity])

  def resolveFieldToShape: (FieldId, ParameterBindings) => Option[ResolvedTrail]

  def tryResolveFieldFromKey: (ShapeEntity, String) => Option[FieldId]
}

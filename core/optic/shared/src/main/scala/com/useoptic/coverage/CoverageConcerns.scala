package com.useoptic.coverage

import com.useoptic.contexts.requests.Commands.{PathComponentId, RequestId, ResponseId}
import com.useoptic.diff.interactions.InteractionDiffResult
import com.useoptic.diff.shapes.ShapeTrail
import com.useoptic.dsa.Counter
import com.useoptic.serialization.StableHashable

import scala.scalajs.js.annotation.{JSExportAll, JSExportDescendentClasses}

@JSExportDescendentClasses
@JSExportAll
sealed trait CoverageConcerns extends StableHashable

////////////////////////////////////////////////////////////////////////////////////////////////

case class TotalInteractions() extends CoverageConcerns

case class TotalUnmatchedPath() extends CoverageConcerns

case class TotalForPath(pathId: PathComponentId) extends CoverageConcerns

case class TotalForPathAndMethod(pathId: PathComponentId, httpMethod: String) extends CoverageConcerns

case class TotalForPathAndMethodAndStatusCode(pathId: PathComponentId, httpMethod: String, httpStatusCode: Int) extends CoverageConcerns

case class TotalForPathAndMethodWithoutBody(pathId: PathComponentId, httpMethod: String) extends CoverageConcerns

case class TotalForPathAndMethodAndContentType(pathId: PathComponentId, httpMethod: String, requestContentType: String) extends CoverageConcerns

case class TotalForPathAndMethodAndStatusCodeWithoutBody(pathId: PathComponentId, httpMethod: String, httpStatusCode: Int) extends CoverageConcerns

case class TotalForPathAndMethodAndStatusCodeAndContentType(pathId: PathComponentId, httpMethod: String, httpStatusCode: Int, responseContentType: String) extends CoverageConcerns

case class TotalForRequest(requestId: RequestId) extends CoverageConcerns

case class TotalForResponse(responseId: ResponseId) extends CoverageConcerns

////////////////////////////////////////////////////////////////////////////////////////////////

case class TotalForRequestBodyItem(requestId: RequestId, shapeTrail: ShapeTrail) extends CoverageConcerns

case class TotalForRequestBodyItemVariant(requestId: RequestId, shapeTrail: ShapeTrail, polymorphismVariantId: String) extends CoverageConcerns

case class TotalForResponseBodyItem(requestId: RequestId, shapeTrail: ShapeTrail) extends CoverageConcerns

case class TotalForResponseBodyItemVariant(requestId: RequestId, shapeTrail: ShapeTrail, polymorphismVariantId: String) extends CoverageConcerns

////////////////////////////////////////////////////////////////////////////////////////////////
//
//case class BooleanDistributionMetadata(trueCount: Int, falseCount: Int)
//
//case class StringDistributionMetadata(emptyCount: Int, minLength: Int, maxLength: Int)
//
//case class NumberDistributionMetadata(zeroCount: Int, min: Int, max: Int)
//
//case class OptionalDistributionMetdata(providedCount: Int, omittedCount: Int)
//
//case class NullableDistributionMetadata(providedCount: Int, omittedCount: Int)
//
//case class ArrayDistributionMetadata(emptyCount: Int, minLength: Int, maxLength: Int)
//
//case class ObjectDistributionMetadata(count: Int) // each shape hash would get its own??

////////////////////////////////////////////////////////////////////////////////////////////////

case class Report(
                   trafficCounts: Counter[CoverageConcerns],
                   diffCounts: Counter[InteractionDiffResult],
                   diffs: Set[InteractionDiffResult]

                 )

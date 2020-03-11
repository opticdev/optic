package com.useoptic.coverage

import com.useoptic.contexts.requests.Commands.{PathComponentId, RequestId, ResponseId}
import com.useoptic.diff.interactions.InteractionDiffResult
import com.useoptic.diff.shapes.ShapeTrail
import com.useoptic.dsa.Counter
import com.useoptic.serialization.StableHashable

sealed trait CoverageConcerns extends StableHashable

////////////////////////////////////////////////////////////////////////////////////////////////

case class TotalInteractions()

case class TotalUnmatchedPath()

case class TotalForPath(pathId: PathComponentId)

case class TotalForPathAndMethod(pathId: PathComponentId, httpMethod: String)

case class TotalForPathAndMethodAndStatusCode(pathId: PathComponentId, httpMethod: String, httpStatusCode: Int)

case class TotalForPathAndMethodWithoutBody(pathId: PathComponentId, httpMethod: String)

case class TotalForPathAndMethodAndContentType(pathId: PathComponentId, httpMethod: String, requestContentType: String)

case class TotalForPathAndMethodAndStatusCodeWithoutBody(pathId: PathComponentId, httpMethod: String, httpStatusCode: Int)

case class TotalForPathAndMethodAndStatusCodeAndContentType(pathId: PathComponentId, httpMethod: String, httpStatusCode: Int, requestContentType: String)

case class TotalForRequest(requestId: RequestId)

case class TotalForResponse(responseId: ResponseId)

////////////////////////////////////////////////////////////////////////////////////////////////

case class TotalForRequestBodyItem(requestId: RequestId, shapeTrail: ShapeTrail)

case class TotalForRequestBodyItemShapeHash(requestId: RequestId, shapeTrail: ShapeTrail, polymorphismVariantId: String)

case class TotalForResponseBodyItem(requestId: RequestId, shapeTrail: ShapeTrail)

case class TotalForResponseBodyItemShapeHash(requestId: RequestId, shapeTrail: ShapeTrail, polymorphismVariantId: String)

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

package com.useoptic.contexts.rfc.projections

import com.useoptic.contexts.requests.Commands.{PathComponentId, RequestId}
import com.useoptic.contexts.shapes.Commands.ShapeId
import com.useoptic.contexts.shapes.projections.NamedShape

object ComplexityScoreProjection {
  def calculate(pathIdsByRequestId: Map[RequestId, PathComponentId], namedShapes: Map[ShapeId, NamedShape]): String = {

    val requestCount = pathIdsByRequestId.keySet.size
    val conceptsCount = namedShapes.size

    if (requestCount == 0 && conceptsCount == 0) {
      return "Empty"
    }

    if (requestCount < 10 && (requestCount * 2.5) > conceptsCount) {
      return "Simple"
    }

    if (requestCount < 25 && (requestCount * 2.5) > conceptsCount) {
      return "Medium"
    }

    return "Complex"
  }

}

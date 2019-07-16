package com.seamless.contexts.rfc.projections

import com.seamless.contexts.data_types.projections.AllConcepts
import com.seamless.contexts.requests.Commands.RequestId
import com.seamless.contexts.requests.HttpRequest

object ComplexityScoreProjection {

  def calculate(requests: Map[RequestId, HttpRequest], allConcepts: AllConcepts): String = {

    val pathsWithRequests = requests.filter(!_._2.isRemoved).map(_._2.requestDescriptor.pathComponentId).toSet.size
    val concepts = allConcepts.allowedReferences.size

    if (pathsWithRequests == 0 && concepts == 0) {
      return "Empty"
    }


    if (pathsWithRequests < 10 && (pathsWithRequests * 2.5) > concepts ) {
      return "Simple"
    }

    if (pathsWithRequests < 25 && (pathsWithRequests * 2.5) > concepts ) {
      return "Medium"
    }

    return "Complex"
  }

}

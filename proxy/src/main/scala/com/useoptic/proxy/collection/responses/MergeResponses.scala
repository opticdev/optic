package com.useoptic.proxy.collection.responses

import com.useoptic.common.spec_types.Response
import com.useoptic.proxy.collection.body.BodyParser
import com.useoptic.proxy.collection.headers.HeaderParser

object MergeResponses {
  def mergeResponses(responses: Vector[Response]): Vector[Response] = {

    val groupedByStatus = responses.groupBy(_.status)

    val (noMerge, requiresMerge) = groupedByStatus.partition(i => i._2.size == 1)

    val mergedResponse = requiresMerge.map{ case (status, responses) => {

      val (contentType, schema) = BodyParser.mergeBody(responses.map(i => (i.contentType, i.schema)):_*)

      val mergedHeaders = HeaderParser.mergeHeaders(responses.flatMap(_.headers))

      Response(status, mergedHeaders, contentType, schema)
    }}

    (mergedResponse ++ noMerge.values.flatten).toVector.sortBy(_.status)
  }
}

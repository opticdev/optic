package com.seamless

import com.seamless.contexts.requests.Commands.{PathComponentId, RequestId, ResponseId, ShapedBodyDescriptor, UnsetBodyDescriptor}
import com.seamless.contexts.requests.HttpResponse
import com.seamless.contexts.rfc.RfcState

package object changelog {
  case class ChangelogInput(historicalPaths: Map[RequestId, PathComponentId], headPaths: Map[RequestId, PathComponentId],
                            historicalState: RfcState, headState: RfcState)

  case class RequestChangeHelper(requestId: RequestId, rfcState: RfcState) {

    def responses: Map[ResponseId, ResponseChangeHelper] = rfcState.requestsState.responses.collect {
      case i if i._2.responseDescriptor.requestId == requestId => (i._1, ResponseChangeHelper(i._2, rfcState))
    }

    def requestBody: Option[ShapedBodyDescriptor] = rfcState.requestsState.requests(requestId).requestDescriptor.bodyDescriptor match {
      case UnsetBodyDescriptor() => None
      case body: ShapedBodyDescriptor => Some(body)
    }
  }

  case class ResponseChangeHelper(response: HttpResponse, rfcState: RfcState) {
    def descriptor = response.responseDescriptor
    def statusCode = response.responseDescriptor.httpStatusCode

    def body = response.responseDescriptor.bodyDescriptor
    def shapedBody = response.responseDescriptor.bodyDescriptor.asInstanceOf[ShapedBodyDescriptor]
    def emptyBody = response.responseDescriptor.bodyDescriptor == UnsetBodyDescriptor()
    def hasBody = !emptyBody
  }

}

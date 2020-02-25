package com.useoptic

import com.useoptic.contexts.requests.Commands.{PathComponentId, RequestId, ResponseId, ShapedBodyDescriptor, UnsetBodyDescriptor}
import com.useoptic.contexts.requests.HttpResponse
import com.useoptic.contexts.rfc.Events.RfcEvent
import com.useoptic.contexts.rfc.RfcState
import com.useoptic.contexts.shapes.Commands.ShapeId
import com.useoptic.diff.ShapeLike

package object changelog {
  case class ChangelogInput(historicalPaths: Map[RequestId, PathComponentId],
                            headPaths: Map[RequestId, PathComponentId],
                            historicalState: RfcState,
                            headState: RfcState,
                            historicalEvents: Vector[RfcEvent],
                            headEvents: Vector[RfcEvent])


  def shapeLikeFromId(shapeId: ShapeId, rfcState: RfcState) = {
    val entity = rfcState.shapesState.shapes.get(shapeId)
    ShapeLike.fromShapeEntity(entity, rfcState, shapeId)
  }

  case class RequestChangeHelper(requestId: RequestId, rfcState: RfcState) {

    def responses: Map[ResponseId, ResponseChangeHelper] = {
      val request = rfcState.requestsState.requests(requestId)
      rfcState.requestsState.responses.collect {
        case i if i._2.responseDescriptor.pathId == request.requestDescriptor.pathComponentId && i._2.responseDescriptor.httpMethod == request.requestDescriptor.httpMethod => (i._1, ResponseChangeHelper(i._2, rfcState))
      }
    }

    def pathId = rfcState.requestsState.requests(requestId).requestDescriptor.pathComponentId

    def allStatusCodes: Set[Int] = responses.values.map(_.statusCode).toSet

    def method = rfcState.requestsState.requests(requestId).requestDescriptor.httpMethod

    def bodyContentType = rfcState.requestsState.requests(requestId).requestDescriptor.bodyDescriptor match {
      case UnsetBodyDescriptor() => null
      case body: ShapedBodyDescriptor => body.httpContentType
    }

    def bodyShape: ShapeLike = rfcState.requestsState.requests(requestId).requestDescriptor.bodyDescriptor match {
      case UnsetBodyDescriptor() => shapeLikeFromId(null, rfcState)
      case body: ShapedBodyDescriptor => shapeLikeFromId(body.shapeId, rfcState)
    }

  }

  case class ResponseChangeHelper(response: HttpResponse, rfcState: RfcState) {
    def descriptor = response.responseDescriptor
    def statusCode = response.responseDescriptor.httpStatusCode

    def bodyContentType = response.responseDescriptor.bodyDescriptor match {
      case UnsetBodyDescriptor() => null
      case body: ShapedBodyDescriptor => body.httpContentType
    }

    def bodyShape: ShapeLike = response.responseDescriptor.bodyDescriptor match {
      case UnsetBodyDescriptor() => shapeLikeFromId(null, rfcState)
      case body: ShapedBodyDescriptor => shapeLikeFromId(body.shapeId, rfcState)
    }

  }

}

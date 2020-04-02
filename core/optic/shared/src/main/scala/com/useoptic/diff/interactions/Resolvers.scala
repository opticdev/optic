package com.useoptic.diff.interactions

import com.useoptic.contexts.requests.Commands.PathComponentId
import com.useoptic.contexts.requests.{Commands, HttpRequest, HttpResponse, RequestsState, Utilities}
import com.useoptic.contexts.shapes.Commands.ShapeId
import com.useoptic.types.capture.HttpInteraction


object Resolvers {
  def resolveOperations(interaction: HttpInteraction, pathId: Commands.PathComponentId, requestsState: RequestsState) = {
    requestsState.requests.values
      .filter(r => (
        r.requestDescriptor.pathComponentId == pathId
          && r.requestDescriptor.httpMethod == interaction.request.method
        )
      )
  }

  def resolveOperations(method: String, pathId: Commands.PathComponentId, requestsState: RequestsState) = {
    requestsState.requests.values
      .filter(r => (
        r.requestDescriptor.pathComponentId == pathId
          && r.requestDescriptor.httpMethod == method
        )
      )
  }

  def resolveResponses(interaction: HttpInteraction, requestId: Commands.RequestId, requestsState: RequestsState) = {
    val request = requestsState.requests(requestId)
    println(requestsState.responses.values)
    requestsState.responses.values
      .filter(r => {
        (
          r.responseDescriptor.pathId == request.requestDescriptor.pathComponentId
            && r.responseDescriptor.httpMethod == request.requestDescriptor.httpMethod
            && r.responseDescriptor.httpStatusCode == interaction.response.statusCode
          )
      })
  }

  def resolveResponses(method: String, pathId: Commands.PathComponentId, requestsState: RequestsState) = {
    requestsState.responses.values
      .filter(r => {
        (
          r.responseDescriptor.pathId == pathId
            && r.responseDescriptor.httpMethod == method
          )
      })
  }


  def resolveResponsesByPathAndMethod(interaction: HttpInteraction, pathId: PathComponentId, requestsState: RequestsState) = {
    requestsState.responses.values
      .filter(r => {
        (
          r.responseDescriptor.pathId == pathId
            && r.responseDescriptor.httpMethod == interaction.request.method
            && r.responseDescriptor.httpStatusCode == interaction.response.statusCode
          )
      })
  }

  def resolveRequestShapeByInteraction(interaction: HttpInteraction, pathId: PathComponentId, requestsState: RequestsState): Option[ShapeId] = {
    resolveOperations(interaction, pathId, requestsState).find(r => {
      r.requestDescriptor.bodyDescriptor match {
        case d: Commands.UnsetBodyDescriptor => interaction.request.body.contentType.isEmpty
        case d: Commands.ShapedBodyDescriptor => interaction.request.body.contentType.contains(d.httpContentType)
      }
    }).flatMap(_.requestDescriptor.bodyDescriptor match {
      case Commands.UnsetBodyDescriptor() => None
      case Commands.ShapedBodyDescriptor(httpContentType, shapeId, isRemoved) => Some(shapeId)
    })
  }

  def resolveResponseShapeByInteraction(interaction: HttpInteraction, pathId: PathComponentId, requestsState: RequestsState): Option[ShapeId] = {
    resolveResponsesByPathAndMethod(interaction, pathId, requestsState).find(r => {
      r.responseDescriptor.bodyDescriptor match {
        case d: Commands.UnsetBodyDescriptor => interaction.response.body.contentType.isEmpty
        case d: Commands.ShapedBodyDescriptor => interaction.response.body.contentType.contains(d.httpContentType)
      }
    }).flatMap(_.responseDescriptor.bodyDescriptor match {
      case Commands.UnsetBodyDescriptor() => None
      case Commands.ShapedBodyDescriptor(httpContentType, shapeId, isRemoved) => Some(shapeId)
    })
  }

}

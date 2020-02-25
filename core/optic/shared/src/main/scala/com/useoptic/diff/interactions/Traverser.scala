package com.useoptic.diff.interactions

import com.useoptic.contexts.requests.Commands.PathComponentId
import com.useoptic.contexts.requests._
import com.useoptic.contexts.rfc.RfcState
import com.useoptic.types.capture.HttpInteraction

case class PathTraversalResult(specTraversalContext: Option[PathComponentId])

class Traverser(spec: RfcState, visitors: Visitors) {
  def traverse(interaction: HttpInteraction) {
    val resolvedPath = Utilities.resolvePath(interaction.request.path, spec.requestsState.pathComponents)
    visitors.pathVisitor.visit(interaction, PathVisitorContext(spec, resolvedPath))
    visitors.operationVisitor.begin()
    visitors.requestBodyVisitor.begin()
    visitors.responseBodyVisitor.begin()
    resolvedPath match {
      case Some(pathId) => {
        val resolvedOperations = Resolvers.resolveOperations(interaction, pathId, spec.requestsState)
        if (resolvedOperations.isEmpty) {
          traverseOperation(interaction, resolvedPath, None)
        } else {
          resolvedOperations.foreach(o => traverseOperation(interaction, resolvedPath, Some(o)))
        }
      }
      case None => {
        traverseOperation(interaction, resolvedPath, None)
      }
    }
    visitors.operationVisitor.end(interaction, PathVisitorContext(spec, resolvedPath))
    visitors.requestBodyVisitor.end(interaction, PathVisitorContext(spec, resolvedPath))
    visitors.responseBodyVisitor.end(interaction, PathVisitorContext(spec, resolvedPath))
  }

  def traverseOperation(interaction: HttpInteraction, resolvedPath: Option[PathComponentId], resolvedOperation: Option[HttpRequest]): Unit = {
    visitors.operationVisitor.visit(interaction, OperationVisitorContext(spec, resolvedPath, resolvedOperation))
    traverseRequest(interaction, resolvedPath, resolvedOperation)
    resolvedOperation match {
      case Some(request) => {
        println(request)
        println(request.requestId)
        val resolvedResponses = Resolvers.resolveResponses(interaction, request.requestId, spec.requestsState)
        if (resolvedResponses.isEmpty) {
          traverseResponse(interaction, resolvedPath, resolvedOperation, None)
        } else {
          resolvedResponses.foreach(response => traverseResponse(interaction, resolvedPath, resolvedOperation, Some(response)))
        }
      }
      case None => {
        traverseResponse(interaction, resolvedPath, resolvedOperation, None)
      }
    }
  }

  def traverseRequest(interaction: HttpInteraction, resolvedPath: Option[PathComponentId], resolvedOperation: Option[HttpRequest]): Unit = {
    //@TODO: headers
    //@TODO: query params
    visitors.requestBodyVisitor.visit(interaction, RequestBodyVisitorContext(spec, resolvedPath, resolvedOperation))
  }

  def traverseResponse(interaction: HttpInteraction, resolvedPath: Option[PathComponentId], resolvedOperation: Option[HttpRequest], resolvedResponse: Option[HttpResponse]): Unit = {
    //@TODO: headers
    visitors.responseBodyVisitor.visit(interaction, ResponseBodyVisitorContext(spec, resolvedPath, resolvedOperation, resolvedResponse))
  }
}

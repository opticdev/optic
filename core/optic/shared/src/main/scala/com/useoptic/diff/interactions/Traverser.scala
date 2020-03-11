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

    visitors.requestBodyVisitor.begin()
    resolvedPath match {
      case Some(pathId) => {
        val resolvedOperations = Resolvers.resolveOperations(interaction, pathId, spec.requestsState)
        if (resolvedOperations.isEmpty) {
          traverseRequest(interaction, resolvedPath, None)
        } else {
          resolvedOperations.foreach(o => traverseRequest(interaction, resolvedPath, Some(o)))
        }
      }
      case None => {
        traverseRequest(interaction, resolvedPath, None)
      }
    }
    visitors.requestBodyVisitor.end(interaction, PathVisitorContext(spec, resolvedPath))

    visitors.responseBodyVisitor.begin()
    resolvedPath match {
      case Some(pathId) => {
        val resolvedResponses = Resolvers.resolveResponsesByPathAndMethod(interaction, pathId, spec.requestsState)
        if (resolvedResponses.isEmpty) {
          traverseResponse(interaction, resolvedPath, None)
        } else {
          resolvedResponses.foreach(response => traverseResponse(interaction, resolvedPath, Some(response)))
        }
      }
      case None => {
        traverseResponse(interaction, resolvedPath, None)
      }
    }
    visitors.responseBodyVisitor.end(interaction, PathVisitorContext(spec, resolvedPath))
  }


  def traverseRequest(interaction: HttpInteraction, resolvedPath: Option[PathComponentId], resolvedOperation: Option[HttpRequest]): Unit = {
    //@TODO: headers
    //@TODO: query params
    visitors.requestBodyVisitor.visit(interaction, RequestBodyVisitorContext(spec, resolvedPath, resolvedOperation))
  }

  def traverseResponse(interaction: HttpInteraction, resolvedPath: Option[PathComponentId], resolvedResponse: Option[HttpResponse]): Unit = {
    //@TODO: headers
    visitors.responseBodyVisitor.visit(interaction, ResponseBodyVisitorContext(spec, resolvedPath, resolvedResponse))
  }
}

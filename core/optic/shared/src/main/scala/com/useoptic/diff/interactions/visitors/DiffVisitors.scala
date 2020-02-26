package com.useoptic.diff.interactions.visitors

import com.useoptic.contexts.requests.Commands.{RequestId, ResponseId, ShapedBodyDescriptor, UnsetBodyDescriptor}
import com.useoptic.contexts.requests.HttpResponse
import com.useoptic.diff.interactions.{BodyUtilities, Helpers, InteractionDiffResult, InteractionTrail, Method, OperationVisitor, OperationVisitorContext, PathVisitor, PathVisitorContext, RequestBody, RequestBodyVisitor, RequestBodyVisitorContext, ResponseBody, ResponseBodyVisitor, ResponseBodyVisitorContext, ResponseStatusCode, SpecRequestBody, SpecRequestRoot, SpecResponseBody, SpecResponseRoot, SpecRoot, UnmatchedRequestBodyContentType, UnmatchedRequestBodyShape, UnmatchedRequestMethod, UnmatchedRequestUrl, UnmatchedResponseBodyContentType, UnmatchedResponseBodyShape, UnmatchedResponseStatusCode, Url, Visitors}
import com.useoptic.diff.shapes.{JsonTrail, ShapeTrail, UnmatchedShape}
import com.useoptic.types.capture.HttpInteraction

class DiffVisitors extends Visitors {
  var diffs: Iterator[InteractionDiffResult] = Iterator()

  def emit(diff: InteractionDiffResult) = {
    diffs = diffs ++ Iterator(diff)
  }

  override val pathVisitor = new PathVisitor {
    def visit(interaction: HttpInteraction, context: PathVisitorContext): Unit = {
      println("visiting path", interaction.request.path, context.path)
      if (context.path.isEmpty) {
        val interactionTrail = InteractionTrail(Seq())
        val requestsTrail = SpecRoot()
        emit(UnmatchedRequestUrl(interactionTrail, requestsTrail))
      }
    }
  }

  class DiffOperationVisitor(var visited: Seq[String] = null) extends OperationVisitor {

    override def begin(): Unit = {
      visited = Seq()
    }

    override def visit(interaction: HttpInteraction, context: OperationVisitorContext): Unit = {
      println("visiting operation", interaction.request.method, context.request)
      if (context.path.isEmpty) {
        return
      }
      if (context.request.isDefined) {
        visited = visited :+ context.request.get.requestId
      }
    }

    override def end(interaction: HttpInteraction, context: PathVisitorContext): Unit = {
      if (context.path.isEmpty) {
        return
      }
      if (visited.isEmpty) {
        val interactionTrail = InteractionTrail(Seq())
        val requestsTrail = SpecRoot()
        emit(UnmatchedRequestMethod(interactionTrail, requestsTrail))
      }
    }
  }

  override val operationVisitor = new DiffOperationVisitor()

  class DiffRequestBodyVisitor extends RequestBodyVisitor {
    var visitedWithUnmatchedContentTypes: Set[RequestId] = Set()
    var visitedWithMatchedContentTypes: Set[RequestId] = Set()


    override def begin(): Unit = {
      visitedWithUnmatchedContentTypes = Set()
      visitedWithMatchedContentTypes = Set()
    }


    override def visit(interaction: HttpInteraction, context: RequestBodyVisitorContext): Unit = {
      if (context.path.isEmpty) {
        return
      }
      if (context.request.isEmpty) {
        return
      }
      context.request match {
        case Some(request) => {
          val actualContentType = Helpers.contentType(interaction.request)
          val expectedContentType = request.requestDescriptor.bodyDescriptor
          println(expectedContentType, actualContentType)
          (expectedContentType, actualContentType) match {
            case (expected: UnsetBodyDescriptor, None) => {
              println("spec says no body, request has no body")
              visitedWithMatchedContentTypes = visitedWithMatchedContentTypes + request.requestId
            }
            case (expected: UnsetBodyDescriptor, Some(contentTypeHeader)) => {
              // spec says no body, request has body
              println("spec says no body, request has body")
              visitedWithUnmatchedContentTypes = visitedWithUnmatchedContentTypes + request.requestId
            }
            case (expected: ShapedBodyDescriptor, None) => {
              println("spec says body, request has no body")
              visitedWithUnmatchedContentTypes = visitedWithUnmatchedContentTypes + request.requestId
            }
            case (expected: ShapedBodyDescriptor, Some(contentTypeHeader)) => {
              println("spec says body, request has body")
              if (expected.httpContentType == contentTypeHeader.value) {
                visitedWithMatchedContentTypes = visitedWithMatchedContentTypes + request.requestId
                val shapeDiffVisitors = new com.useoptic.diff.shapes.visitors.DiffVisitors(context.spec)
                val traverser = new com.useoptic.diff.shapes.Traverser(context.spec, shapeDiffVisitors)
                val body = BodyUtilities.parseJsonBody(interaction.request.body)
                traverser.traverse(body, JsonTrail(Seq()), Some(ShapeTrail(expected.shapeId, Seq())))
                shapeDiffVisitors.diffs.foreach(diff => {
                  val interactionTrail = InteractionTrail(Seq(RequestBody(contentTypeHeader.value)))
                  val requestsTrail = SpecRequestBody(request.requestId)
                  emit(UnmatchedRequestBodyShape(interactionTrail, requestsTrail, diff))
                })
              } else {
                visitedWithUnmatchedContentTypes = visitedWithUnmatchedContentTypes + request.requestId
              }
            }
          }
        }
        case None => {
        }
      }
    }

    override def end(interaction: HttpInteraction, context: PathVisitorContext): Unit = {
      if (context.path.isEmpty) {
        return
      }
      if (visitedWithMatchedContentTypes.isEmpty) {

        val actualContentType = Helpers.contentType(interaction.request)
        val interactionTrail = actualContentType match {
          case Some(contentType) => InteractionTrail(Seq(Url(interaction.request.path), Method(interaction.request.method), RequestBody(contentType.value)))
          case None => InteractionTrail(Seq(Url(interaction.request.path), Method(interaction.request.method)))
        }
        println(actualContentType)
        visitedWithUnmatchedContentTypes.foreach(requestId => {
          emit(
            UnmatchedRequestBodyContentType(
              interactionTrail,
              SpecRequestRoot(requestId)))
        })
      }
    }
  }

  override val requestBodyVisitor = new DiffRequestBodyVisitor()

  class DiffResponseBodyVisitor extends ResponseBodyVisitor {
    var visitedWithUnmatchedContentTypes: Set[HttpResponse] = Set()
    var visitedWithMatchedContentTypes: Set[ResponseId] = Set()


    override def begin(): Unit = {
      visitedWithUnmatchedContentTypes = Set()
      visitedWithMatchedContentTypes = Set()
    }

    override def visit(interaction: HttpInteraction, context: ResponseBodyVisitorContext): Unit = {
      if (context.path.isEmpty) {
        return
      }
      if (context.request.isEmpty) {
        return
      }
      if (context.response.isEmpty) {
        println(interaction)
        println("no status code")
        emit(
          UnmatchedResponseStatusCode(
            InteractionTrail(Seq(ResponseStatusCode(interaction.response.statusCode))),
            SpecRequestRoot(context.request.get.requestId)
          )
        )
        return
      }
      val response = context.response.get
      val actualContentType = Helpers.contentType(interaction.response)
      val expectedContentType = response.responseDescriptor.bodyDescriptor
      (expectedContentType, actualContentType) match {
        case (d: UnsetBodyDescriptor, None) => {
          println("spec says no body, response has no body")
          visitedWithMatchedContentTypes = visitedWithMatchedContentTypes + response.responseId
        }
        case (d: UnsetBodyDescriptor, Some(contentTypeHeader)) => {
          println("spec says no body, response has body")
          visitedWithUnmatchedContentTypes = visitedWithUnmatchedContentTypes + response
        }
        case (d: ShapedBodyDescriptor, None) => {
          println("spec says body, response has no body")
          visitedWithUnmatchedContentTypes = visitedWithUnmatchedContentTypes + response
        }
        case (d: ShapedBodyDescriptor, Some(contentTypeHeader)) => {
          println("comparing response bodies")
          if (d.httpContentType == contentTypeHeader.value) {
            visitedWithMatchedContentTypes = visitedWithMatchedContentTypes + response.responseId
            val shapeDiffVisitors = new com.useoptic.diff.shapes.visitors.DiffVisitors(context.spec)
            val traverser = new com.useoptic.diff.shapes.Traverser(context.spec, shapeDiffVisitors)
            val body = BodyUtilities.parseJsonBody(interaction.response.body)
            traverser.traverse(body, JsonTrail(Seq()), Some(ShapeTrail(d.shapeId, Seq())))
            shapeDiffVisitors.diffs.foreach(diff => {
              val interactionTrail = InteractionTrail(Seq(ResponseBody(contentTypeHeader.value, interaction.response.statusCode)))
              val requestsTrail = SpecResponseBody(response.responseId)
              emit(UnmatchedResponseBodyShape(interactionTrail, requestsTrail, diff))
            })
          } else {
            visitedWithUnmatchedContentTypes = visitedWithUnmatchedContentTypes + response
          }
        }
      }
    }

    override def end(interaction: HttpInteraction, context: PathVisitorContext): Unit = {
      if (context.path.isEmpty) {
        return
      }
      if (visitedWithMatchedContentTypes.isEmpty) {
        val actualContentType = Helpers.contentType(interaction.response)
        val interactionTrail = actualContentType match {
          case Some(contentType) => InteractionTrail(Seq(ResponseBody(contentType.value, interaction.response.statusCode)))
          case None => InteractionTrail(Seq(ResponseStatusCode(interaction.response.statusCode)))
        }
        println(actualContentType)
        visitedWithUnmatchedContentTypes.foreach(response => {
          emit(
            UnmatchedResponseBodyContentType(
              interactionTrail,
              SpecResponseBody(response.responseId)))
        })
      }
    }
  }

  override val responseBodyVisitor: ResponseBodyVisitor = new DiffResponseBodyVisitor()
}

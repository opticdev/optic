package com.useoptic.diff.interactions.visitors

import com.useoptic.contexts.requests.Commands._
import com.useoptic.contexts.requests._
import com.useoptic.diff.interactions._
import com.useoptic.diff.shapes.{JsonTrail, ShapeTrail}
import com.useoptic.dsa.Counter
import com.useoptic.logging.Logger
import com.useoptic.types.capture.HttpInteraction

class DiffVisitors extends Visitors {
  var diffs: Iterator[InteractionDiffResult] = Iterator()

  def emit(diff: InteractionDiffResult) = {
    diffs = diffs ++ Iterator(diff)
  }

  override val pathVisitor = new PathVisitor {
    def visit(interaction: HttpInteraction, context: PathVisitorContext): Unit = {
      Logger.log("visiting path", interaction.request.path, context.path)
      if (context.path.isEmpty) {
        val interactionTrail = InteractionTrail(Seq())
        val requestsTrail = SpecRoot()
        emit(UnmatchedRequestUrl(interactionTrail, requestsTrail))
      }
    }
  }

  class DiffOperationVisitor(var visited: Seq[String] = null) extends OperationVisitor {

    override def begin(): Unit = {
    }

    override def visit(interaction: HttpInteraction, context: OperationVisitorContext): Unit = {
    }

    override def end(interaction: HttpInteraction, context: PathVisitorContext): Unit = {
    }
  }

  override val operationVisitor = new DiffOperationVisitor()

  class DiffRequestBodyVisitor extends RequestBodyVisitor {
    var visitedWithUnmatchedContentTypes: Set[RequestId] = Set()
    var visitedWithMatchedContentTypes: Set[RequestId] = Set()
    var visitedShapeTrails: Counter[ShapeTrail] = new Counter[ShapeTrail]

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
          val actualContentType = ContentTypeHelpers.contentType(interaction.request)
          val expectedContentType = request.requestDescriptor.bodyDescriptor
          // Logger.log(expectedContentType, actualContentType)
          (expectedContentType, actualContentType) match {
            case (expected: UnsetBodyDescriptor, None) => {
              // Logger.log("spec says no body, request has no body")
              visitedWithMatchedContentTypes = visitedWithMatchedContentTypes + request.requestId
            }
            case (expected: UnsetBodyDescriptor, Some(contentTypeHeader)) => {
              // spec says no body, request has body
              // Logger.log("spec says no body, request has body")
              visitedWithUnmatchedContentTypes = visitedWithUnmatchedContentTypes + request.requestId
            }
            case (expected: ShapedBodyDescriptor, None) => {
              // Logger.log("spec says body, request has no body")
              visitedWithUnmatchedContentTypes = visitedWithUnmatchedContentTypes + request.requestId
            }
            case (expected: ShapedBodyDescriptor, Some(contentTypeHeader)) => {
              // Logger.log("spec says body, request has body")
              if (expected.httpContentType == contentTypeHeader) {
                visitedWithMatchedContentTypes = visitedWithMatchedContentTypes + request.requestId
                val shapeDiffVisitors = new com.useoptic.diff.shapes.visitors.DiffVisitors(context.spec)
                val traverser = new com.useoptic.diff.shapes.JsonLikeTraverser(context.spec, shapeDiffVisitors)
                val body = BodyUtilities.parseBody(interaction.request.body)
                traverser.traverse(body, JsonTrail(Seq()), Some(ShapeTrail(expected.shapeId, Seq())))

                if (shapeDiffVisitors.diffs.isEmpty) {
                  visitedShapeTrails = shapeDiffVisitors.visitedShapeTrails
                }
                shapeDiffVisitors.diffs.foreach(diff => {
                  val interactionTrail = InteractionTrail(Seq(RequestBody(contentTypeHeader)))
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

        val actualContentType = ContentTypeHelpers.contentType(interaction.request)
        val interactionTrail = actualContentType match {
          case Some(contentType) => InteractionTrail(Seq(Url(), Method(interaction.request.method), RequestBody(contentType)))
          case None => InteractionTrail(Seq(Url(), Method(interaction.request.method)))
        }
        emit(
          UnmatchedRequestBodyContentType(
            interactionTrail,
            SpecPath(context.path.get))
        )
      }
    }
  }

  override val requestBodyVisitor = new DiffRequestBodyVisitor()

  class DiffResponseBodyVisitor extends ResponseBodyVisitor {
    var visitedWithUnmatchedContentTypes: Set[HttpResponse] = Set()
    var visitedWithMatchedContentTypes: Set[ResponseId] = Set()
    var visitedShapeTrails: Counter[ShapeTrail] = new Counter[ShapeTrail]


    override def begin(): Unit = {
      visitedWithUnmatchedContentTypes = Set()
      visitedWithMatchedContentTypes = Set()
    }

    override def visit(interaction: HttpInteraction, context: ResponseBodyVisitorContext): Unit = {
      if (context.path.isEmpty) {
        return
      }
      if (context.response.isEmpty) {
        return
      }
      val response = context.response.get
      val actualContentType = ContentTypeHelpers.contentType(interaction.response)
      val expectedContentType = response.responseDescriptor.bodyDescriptor
      (expectedContentType, actualContentType) match {
        case (d: UnsetBodyDescriptor, None) => {
          // Logger.log("spec says no body, response has no body")
          visitedWithMatchedContentTypes = visitedWithMatchedContentTypes + response.responseId
        }
        case (d: UnsetBodyDescriptor, Some(contentTypeHeader)) => {
          // Logger.log("spec says no body, response has body")
          visitedWithUnmatchedContentTypes = visitedWithUnmatchedContentTypes + response
        }
        case (d: ShapedBodyDescriptor, None) => {
          // Logger.log("spec says body, response has no body")
          visitedWithUnmatchedContentTypes = visitedWithUnmatchedContentTypes + response
        }
        case (d: ShapedBodyDescriptor, Some(contentTypeHeader)) => {
          // Logger.log("comparing response bodies")
          if (d.httpContentType == contentTypeHeader) {
            visitedWithMatchedContentTypes = visitedWithMatchedContentTypes + response.responseId
            val shapeDiffVisitors = new com.useoptic.diff.shapes.visitors.DiffVisitors(context.spec)
            val traverser = new com.useoptic.diff.shapes.JsonLikeTraverser(context.spec, shapeDiffVisitors)
            val body = BodyUtilities.parseBody(interaction.response.body)
            traverser.traverse(body, JsonTrail(Seq()), Some(ShapeTrail(d.shapeId, Seq())))
            if (shapeDiffVisitors.diffs.isEmpty) {
              visitedShapeTrails = shapeDiffVisitors.visitedShapeTrails
            }
            shapeDiffVisitors.diffs.foreach(diff => {
              val interactionTrail = InteractionTrail(Seq(ResponseBody(contentTypeHeader, interaction.response.statusCode)))
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
        val actualContentType = ContentTypeHelpers.contentType(interaction.response)
        val interactionTrail = actualContentType match {
          case Some(contentType) => InteractionTrail(Seq(ResponseBody(contentType, interaction.response.statusCode)))
          case None => InteractionTrail(Seq(ResponseStatusCode(interaction.response.statusCode)))
        }
        emit(
          UnmatchedResponseBodyContentType(
            interactionTrail,
            SpecPath(context.path.get))
        )
      }
    }
  }

  override val responseBodyVisitor = new DiffResponseBodyVisitor()
}

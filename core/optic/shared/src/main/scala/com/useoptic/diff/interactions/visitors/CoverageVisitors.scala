package com.useoptic.diff.interactions.visitors

import com.useoptic.contexts.requests.Commands.{PathComponentId, RequestId, ResponseId}
import com.useoptic.contexts.requests.{RequestsState, Utilities}
import com.useoptic.contexts.rfc.RfcState
import com.useoptic.diff.interactions.{OperationVisitor, OperationVisitorContext, PathVisitor, PathVisitorContext, RequestBodyVisitor, RequestBodyVisitorContext, ResponseBodyVisitor, ResponseBodyVisitorContext, UnmatchedRequestBodyShape, UnmatchedResponseBodyShape, Visitors}
import com.useoptic.diff.shapes.ShapeTrail
import com.useoptic.dsa.Counter
import com.useoptic.types.capture.HttpInteraction


class CoveragePathVisitor(counter: Counter[String]) extends PathVisitor {
  override def visit(interaction: HttpInteraction, context: PathVisitorContext): Unit = {
    val key = KeyFormatters.totalInteractions()
    counter.increment(key)
    if (context.path.isDefined) {
      val key = KeyFormatters.path(context.path.get)
      counter.increment(key)
    }
  }
}

class CoverageOperationVisitor extends OperationVisitor {
  override def begin(): Unit = ???

  override def visit(interaction: HttpInteraction, context: OperationVisitorContext): Unit = ???

  override def end(interaction: HttpInteraction, context: PathVisitorContext): Unit = ???
}

class CoverageRequestBodyVisitor(counter: Counter[String]) extends RequestBodyVisitor {
  val diffVisitors = new DiffVisitors()

  override def begin(): Unit = {
    diffVisitors.requestBodyVisitor.begin()
  }

  override def visit(interaction: HttpInteraction, context: RequestBodyVisitorContext): Unit = {
    diffVisitors.requestBodyVisitor.visit(interaction, context)
  }

  override def end(interaction: HttpInteraction, context: PathVisitorContext): Unit = {
    diffVisitors.requestBodyVisitor.end(interaction, context)
    if (context.path.isEmpty) {
      return
    }
    if (diffVisitors.requestBodyVisitor.visitedWithMatchedContentTypes.nonEmpty) {
      diffVisitors.requestBodyVisitor.visitedWithMatchedContentTypes.foreach(requestId => {
        val key = KeyFormatters.requestBody(requestId)
        counter.increment(key)
      })
      diffVisitors.diffs.foreach(diff => {
        diff match {
          case d: UnmatchedRequestBodyShape =>
        }
      })
    }
  }
}

class CoverageResponseBodyVisitor(counter: Counter[String]) extends ResponseBodyVisitor {
  val diffVisitors = new DiffVisitors()

  override def begin(): Unit = {
    diffVisitors.responseBodyVisitor.begin()
  }

  override def visit(interaction: HttpInteraction, context: ResponseBodyVisitorContext): Unit = {
    diffVisitors.responseBodyVisitor.visit(interaction, context)
  }

  override def end(interaction: HttpInteraction, context: PathVisitorContext): Unit = {
    diffVisitors.responseBodyVisitor.end(interaction, context)
    if (context.path.isEmpty) {
      return
    }
    if (diffVisitors.responseBodyVisitor.visitedWithMatchedContentTypes.nonEmpty) {
      diffVisitors.responseBodyVisitor.visitedWithMatchedContentTypes.foreach(responseId => {
        val key = KeyFormatters.responseBody(responseId)
        counter.increment(key)
      })
    }
    diffVisitors.diffs.foreach(diff => {
      diff match {
        case d: UnmatchedResponseBodyShape =>
      }
    })
  }
}

class CoverageVisitors extends Visitors {
  val counter = new Counter[String]()
  override val pathVisitor: PathVisitor = new CoveragePathVisitor(counter)
  override val operationVisitor: OperationVisitor = new CoverageOperationVisitor()
  override val requestBodyVisitor: RequestBodyVisitor = new CoverageRequestBodyVisitor(counter)
  override val responseBodyVisitor: ResponseBodyVisitor = new CoverageResponseBodyVisitor(counter)
}

case class TotalTrafficPartial(counts: Counter[String])

trait KeyResolver {
  def resolveKeys(interaction: HttpInteraction): Set[String]
}

class TotalKeyResolver extends KeyResolver {
  val totalTrafficCountKey = "total"

  override def resolveKeys(interaction: HttpInteraction): Set[String] = {
    Set(totalTrafficCountKey)
  }
}

class PathKeyResolver(rfcState: RfcState) extends KeyResolver {
  override def resolveKeys(interaction: HttpInteraction): Set[String] = {
    Utilities.resolvePath(interaction.request.path, rfcState.requestsState.pathComponents) match {
      case Some(pathId) => Set(pathId)
      case None => Set.empty
    }
  }
}

object Resolvers {
  def resolveRequest(interaction: HttpInteraction, requestsState: RequestsState) = {
    Utilities.resolvePath(interaction.request.path, requestsState.pathComponents) match {
      case Some(pathId) => {
        requestsState.requests.values
          .find(r => r.requestDescriptor.pathComponentId == pathId && r.requestDescriptor.httpMethod == interaction.request.method)
      }
      case None => None
    }
  }

}

object KeyFormatters {
  def totalInteractions(): String = {
    "total"
  }

  def path(pathId: PathComponentId): String = {
    s"paths-${pathId}"
  }

  def request(pathId: PathComponentId, httpMethod: String): String = {
    s"requests-${pathId}-${httpMethod}"
  }

  def response(pathId: PathComponentId, httpMethod: String, httpStatusCode: Int): String = {
    s"responses-${pathId}-${httpMethod}-${httpStatusCode}"
  }

  def requestBody(requestId: RequestId): String = {
    requestId
  }

  def responseBody(responseId: ResponseId): String = {
    responseId
  }

  def requestBodyShape(requestId: RequestId, shapeTrail: ShapeTrail): String = {
    s"${requestId}-${shapeTrail}"
  }

  def interactionsWithDiffs(): String = {
    "interactions-with-diffs"
  }

  def interactionsWithRequestDiffs(): String = {
    "interactions-with-request-diffs"
  }

  def interactionsWithResponseDiffs(): String = {
    "interactions-with-response-diffs"
  }

  def unrecognizedInteractions(): String = {
    "interactions-not-recognized"
  }

  def interactionsWithoutDiffs(): String = {
    "interactions-without-diffs"
  }
}

class RequestIdKeyResolver(rfcState: RfcState) extends KeyResolver {

  override def resolveKeys(interaction: HttpInteraction): Set[String] = {
    Resolvers.resolveRequest(interaction, rfcState.requestsState) match {
      case Some(request) => Set(request.requestId)
      case None => Set.empty
    }
  }
}

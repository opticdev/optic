package com.useoptic.diff.interactions

import com.useoptic.contexts.requests.Commands.PathComponentId
import com.useoptic.contexts.requests.{HttpRequest, HttpResponse}
import com.useoptic.contexts.rfc.RfcState
import com.useoptic.types.capture.{Body, HttpInteraction}
import io.circe.Json

abstract class PathVisitor {
  def visit(interaction: HttpInteraction, context: PathVisitorContext)
}

abstract class OperationVisitor {
  def begin()

  def visit(interaction: HttpInteraction, context: OperationVisitorContext)

  def end(interaction: HttpInteraction, context: PathVisitorContext)
}

abstract class RequestBodyVisitor {
  def begin()

  def visit(interaction: HttpInteraction, context: RequestBodyVisitorContext)

  def end(interaction: HttpInteraction, context: PathVisitorContext)
}

abstract class ResponseBodyVisitor {
  def begin()

  def visit(interaction: HttpInteraction, context: ResponseBodyVisitorContext)

  def end(interaction: HttpInteraction, context: PathVisitorContext)
}

abstract class Visitors {
  val pathVisitor: PathVisitor
  val operationVisitor: OperationVisitor
  // val requestQueryStringVisitor
  // val requestHeaderVisitor
  val requestBodyVisitor: RequestBodyVisitor
  // val responseHeaderVisitor
  val responseBodyVisitor: ResponseBodyVisitor
}

object BodyUtilities {
  def parseJsonBody(body: Body): Option[Json] = {
    body.asJsonString match {
      case Some(s) => io.circe.parser.parse(s) match {
        case Left(e) => {
          println(e)
          None
        }
        case Right(json) => Some(json)
      }
      case None => {
        body.asText match {
          case None => None
          case Some(s) => Some(Json.fromString(s))
        }
      }
    }
  }
}


case class PathVisitorContext(spec: RfcState, path: Option[PathComponentId])

case class OperationVisitorContext(spec: RfcState, path: Option[PathComponentId], request: Option[HttpRequest])

case class RequestBodyVisitorContext(spec: RfcState, path: Option[PathComponentId], request: Option[HttpRequest])

case class ResponseVisitorContext(spec: RfcState, path: Option[PathComponentId], request: Option[HttpRequest])

case class ResponseBodyVisitorContext(spec: RfcState, path: Option[PathComponentId], request: Option[HttpRequest], response: Option[HttpResponse])
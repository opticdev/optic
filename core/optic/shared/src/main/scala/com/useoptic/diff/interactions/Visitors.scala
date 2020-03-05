package com.useoptic.diff.interactions

import com.useoptic.contexts.requests.Commands.PathComponentId
import com.useoptic.contexts.requests.{HttpRequest, HttpResponse}
import com.useoptic.contexts.rfc.RfcState
import com.useoptic.types.capture.{Body, HttpInteraction, JsonLike, JsonLikeFrom}
import io.circe.Json

import scala.scalajs.js.annotation.{JSExport, JSExportAll}

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

@JSExport
@JSExportAll
object BodyUtilities {
  def parseBody(body: Body): Option[JsonLike] = {
    val asShapeHashBytes = body.value.asShapeHashBytes
    val asJsonString = body.value.asJsonString
    if (asShapeHashBytes.isDefined) {
      if (asJsonString.isDefined) {
        JsonLikeFrom.rawShapeHashWithRawJson(asShapeHashBytes.get.bytes, asJsonString.get)
      } else {
        JsonLikeFrom.rawShapeHash(asShapeHashBytes.get.bytes)
      }
    } else if (asJsonString.isDefined) {
      JsonLikeFrom.rawJson(asJsonString.get)
    } else if (body.value.asText.isDefined) {
      JsonLikeFrom.knownText(body.value.asText.get)
    } else {
      None
    }
  }
  def parseJsonBody(body: Body): Option[Json] = parseBody(body).map(_.asJson)

}


case class PathVisitorContext(spec: RfcState, path: Option[PathComponentId])

case class OperationVisitorContext(spec: RfcState, path: Option[PathComponentId], request: Option[HttpRequest])

case class RequestBodyVisitorContext(spec: RfcState, path: Option[PathComponentId], request: Option[HttpRequest])

case class ResponseVisitorContext(spec: RfcState, path: Option[PathComponentId], request: Option[HttpRequest])

case class ResponseBodyVisitorContext(spec: RfcState, path: Option[PathComponentId], response: Option[HttpResponse])

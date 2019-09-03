package com.seamless.diff

import com.seamless.contexts.requests.Commands._
import com.seamless.contexts.requests._
import com.seamless.contexts.rfc.RfcState
import com.seamless.diff.ShapeDiffer.ShapeDiffResult
import io.circe._

import scala.scalajs.js
import scala.scalajs.js.annotation.{JSExport, JSExportAll}
import scala.util.{Failure, Success, Try}

@JSExport
case class ApiRequest(url: String, method: String, contentType: String, body: Json = Json.Null)

@JSExport
case class ApiResponse(statusCode: Int, contentType: String, body: Json = Json.Null)

@JSExport
case class ApiInteraction(apiRequest: ApiRequest, apiResponse: ApiResponse)

@JSExport
@JSExportAll
object JsonHelper {

  import js.JSConverters._

  def fromString(s: String): Json = {
    import io.circe.parser._
    Try {
      parse(s).right.get
    } match {
      case Failure(exception) => {
        println(exception)
        Json.Null
      }
      case Success(value) => value
    }
  }

  //def fromAny(any: js.Any): Json = any.asJson

  def seqToJsArray(x: Seq[AnyVal]): js.Array[AnyVal] = {
    x.toJSArray
  }
}

@JSExport
@JSExportAll
object RequestDiffer {

  sealed trait RequestDiffResult
  case class NoDiff() extends RequestDiffResult
  case class UnmatchedUrl(url: String) extends RequestDiffResult
  case class UnmatchedHttpMethod(pathId: PathComponentId, method: String) extends RequestDiffResult
  case class UnmatchedHttpStatusCode(requestId: RequestId, statusCode: Int) extends RequestDiffResult
  case class UnmatchedResponseContentType(responseId: ResponseId, contentType: String, previousContentType: String, statusCode: Int) extends RequestDiffResult
  case class UnmatchedResponseBodyShape(responseId: ResponseId, contentType: String, responseStatusCode: Int, shapeDiff: ShapeDiffResult) extends RequestDiffResult
  case class UnmatchedRequestBodyShape(requestId: RequestId, contentType: String, shapeDiff: ShapeDiffResult) extends RequestDiffResult
  case class UnmatchedRequestContentType(requestId: RequestId, contentType: String, previousContentType: String) extends RequestDiffResult

  def compare(interaction: ApiInteraction, spec: RfcState): RequestDiffResult = {
    // check for matching path
    val matchedPath = Utilities.resolvePath(interaction.apiRequest.url, spec.requestsState.pathComponents)

    if (matchedPath.isEmpty) return UnmatchedUrl(interaction.apiRequest.url)

    // check for matching http method/verb
    val pathId = matchedPath.get
    val matchedOperation = spec.requestsState.requests.values
      .find(r => r.requestDescriptor.pathComponentId == pathId && r.requestDescriptor.httpMethod == interaction.apiRequest.method)

    if (matchedOperation.isEmpty) {
      return UnmatchedHttpMethod(pathId, interaction.apiRequest.method)
    }
    val request = matchedOperation.get
    if ((200 until 400) contains interaction.apiResponse.statusCode) {
      println(request.requestDescriptor.bodyDescriptor, interaction.apiRequest.body)
      val requestDiff: Option[RequestDiffResult] = request.requestDescriptor.bodyDescriptor match {
        case d: UnsetBodyDescriptor => {
          if (interaction.apiRequest.body == Json.Null) {
            None
          } else {
            Some(UnmatchedRequestBodyShape(request.requestId, interaction.apiRequest.contentType, ShapeDiffer.UnsetShape(interaction.apiRequest.body)))
          }
        }
        case d: ShapedBodyDescriptor => {
          if (d.httpContentType == interaction.apiRequest.contentType) {
            val shape = spec.shapesState.shapes(d.shapeId)
            val shapeDiff = ShapeDiffer.diff(shape, interaction.apiRequest.body)(spec.shapesState)
            if (shapeDiff.isInstanceOf[NoDiff]) {
              None
            } else {
              Some(UnmatchedRequestBodyShape(request.requestId, interaction.apiRequest.contentType, shapeDiff))
            }
          } else {
            Some(UnmatchedRequestContentType(request.requestId, interaction.apiRequest.contentType, d.httpContentType))
          }
        }
      }
      if (requestDiff.isDefined) {
        return requestDiff.get
      }
    }

    // check for matching response status
    val matchedResponse = spec.requestsState.responses.values
      .find(r => r.responseDescriptor.requestId == matchedOperation.get.requestId && r.responseDescriptor.httpStatusCode == interaction.apiResponse.statusCode)

    if (matchedResponse.isEmpty) {
      return UnmatchedHttpStatusCode(matchedOperation.get.requestId, interaction.apiResponse.statusCode)
    }

    ///val requestBodyDiff: RequestBodyDiff =

    val responseId = matchedResponse.get.responseId;
    val responseDiff: Option[RequestDiffResult] = matchedResponse.get.responseDescriptor.bodyDescriptor match {
      case d: UnsetBodyDescriptor => {
        if (interaction.apiResponse.body == Json.Null) {
          None
        } else {
          Some(
            UnmatchedResponseBodyShape(responseId, interaction.apiResponse.contentType, interaction.apiResponse.statusCode,
              ShapeDiffer.UnsetShape(interaction.apiResponse.body))
          )
        }
      }
      case d: ShapedBodyDescriptor => {
        //@TODO: check content type
        if (d.httpContentType == interaction.apiResponse.contentType) {
          val shape = spec.shapesState.shapes(d.shapeId)
          val shapeDiff = ShapeDiffer.diff(shape, interaction.apiResponse.body)(spec.shapesState)
          if (shapeDiff == ShapeDiffer.NoDiff()) {
            None
          } else {
            Some(UnmatchedResponseBodyShape(responseId, interaction.apiResponse.contentType, interaction.apiResponse.statusCode, shapeDiff))
          }
        } else {
          Some(UnmatchedResponseContentType(matchedResponse.get.responseId, interaction.apiResponse.contentType, d.httpContentType, interaction.apiResponse.statusCode))
        }
      }
    }

    if (responseDiff.isDefined) {
      return responseDiff.get
    }

    // accumulate diffs for request (headers, query params, body) and response (headers, body)
    NoDiff()
  }
}

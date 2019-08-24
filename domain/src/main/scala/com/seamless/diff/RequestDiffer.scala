package com.seamless.diff

import com.seamless.contexts.requests.Commands._
import com.seamless.contexts.requests._
import com.seamless.contexts.rfc.RfcState
import io.circe.Json

import scala.scalajs.js
import scala.scalajs.js.annotation.{JSExport, JSExportAll}
import scala.util.{Failure, Success, Try}

@JSExport
case class ApiRequest(url: String, method: String, body: Json = null)

@JSExport
case class ApiResponse(statusCode: Int, body: Json = null)

@JSExport
case class ApiInteraction(apiRequest: ApiRequest, apiResponse: ApiResponse)

@JSExport
@JSExportAll
object JsonHelper {
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

  def seqToJsArray(x: Seq[AnyVal]): js.Array[AnyVal] = {
    import js.JSConverters._

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

  def compare(interaction: ApiInteraction, spec: RfcState): RequestDiffResult = {
    println(interaction)
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

    //@TODO: only diff request body/etc. on 2xx/3xx
    //@TODO: always diff response by status code and content-type

    // check for matching response status
    val matchedResponse = spec.requestsState.responses.values
      .find(r => r.responseDescriptor.httpStatusCode == interaction.apiResponse.statusCode)

    if (matchedResponse.isEmpty) {
      return UnmatchedHttpStatusCode(matchedOperation.get.requestId, interaction.apiResponse.statusCode)
    }

    ///val requestBodyDiff: RequestBodyDiff =

    /*val responseBodyDiff: ResponseBodyDiff = matchedResponse.get.responseDescriptor.bodyDescriptor match {
      case d: UnsetBodyDescriptor => {

      }
      case d: ShapedBodyDescriptor => {
        //@TODO: check content type
      }
    }*/

    // accumulate diffs for request (headers, query params, body) and response (headers, body)


    NoDiff()
  }
}

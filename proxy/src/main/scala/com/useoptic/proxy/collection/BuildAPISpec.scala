package com.useoptic.proxy.collection

import akka.http.scaladsl.model.HttpHeader
import com.useoptic.common.spec_types.{Endpoint, RequestBody, Response}
import com.useoptic.proxy.OpticAPIConfiguration
import com.useoptic.proxy.collection.body.BodyParser
import com.useoptic.proxy.collection.cookie.CookieParser
import com.useoptic.proxy.collection.headers.HeaderParser
import com.useoptic.proxy.collection.query.QueryParser
import com.useoptic.proxy.collection.responses.MergeResponses
import com.useoptic.proxy.collection.url.URLParser
import play.api.libs.json.JsObject

import scala.util.Try

object BuildAPISpec {
  def endPointsFromInteractions(apInteractions: Vector[APIInteraction], opticAPIConfiguration: OpticAPIConfiguration): Vector[Try[Endpoint]] = {

    val matchResults = apInteractions.map {case interaction => (interaction, URLParser.parse(interaction.request.fullPath, opticAPIConfiguration.paths))}
    val (unmatched, matched) = matchResults.partition(_._2.isLeft) //handle these with issues later

    matched.map {
      case (APIInteraction(request, response), Right(urlhint)) => Try {
        val pathIssues = scala.collection.mutable.ListBuffer[Exception]()

        //Handle Request
        val queryParameters = QueryParser.parseQuery(request.fullPath)

        val requestBody = request.entity.flatMap(BodyParser.parse)

        val requestCookies = CookieParser.parseHeadersIntoCookies(request.headers)
        val requestHeaders = HeaderParser.parseHeaders(request.headers)

        //Handle Response
        val statusCode = response.statusCode
        val responseHeaders = HeaderParser.parseHeaders(response.headers)
        val responseBody = response.entity.flatMap(BodyParser.parse)

        Endpoint(
          request.method,
          urlhint.path,
          queryParameters ++ requestCookies ++ requestHeaders,
          requestBody,
          Vector(
            Response(statusCode, responseHeaders, responseBody.map(_.contentType), responseBody.map(_.schema.getOrElse(JsObject.empty)))
          )
        )
      }
    }

  }

  def mergeEndpoints(observedEndpoints: Vector[Endpoint]) = {
    val groupedByPath = observedEndpoints.groupBy(i=> (i.method, i.url))

    groupedByPath.map {case ((method, url), endpointSeq) => {

      //@assumption -- there's no reason to merge request input from a failed request
      val with200s = endpointSeq.filter(_.responses.exists(_.isSuccessResponse))

      val mergedQueryParameters = QueryParser.mergeQueryParameters(with200s.flatMap(_.queryParameters))
      val mergedCookieParameters = CookieParser.mergeCookies(with200s.flatMap(_.cookieParameters))
      val mergedHeaders = HeaderParser.mergeHeaders(with200s.flatMap(_.headerParameters))


      val (requestContentType, requestSchema) = BodyParser.mergeBody(with200s.flatMap(_.body.map(i => (Some(i.contentType), i.schema))): _*)

      val mergedResponses = MergeResponses.mergeResponses(endpointSeq.flatMap(_.responses))

      Endpoint(
        method,
        url,
        mergedQueryParameters ++ mergedCookieParameters ++ mergedHeaders,
        if (requestContentType.isDefined && requestSchema.isDefined) Some(RequestBody(requestContentType.get, requestSchema)) else None,
        mergedResponses
      )
    }}

  }
}

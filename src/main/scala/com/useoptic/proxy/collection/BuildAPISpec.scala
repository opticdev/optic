package com.useoptic.proxy.collection

import akka.http.scaladsl.model.HttpHeader
import com.useoptic.proxy.OpticAPIConfiguration
import com.useoptic.proxy.collection.body.BodyParser
import com.useoptic.proxy.collection.headers.HeaderParser
import com.useoptic.proxy.collection.query.QueryParser
import com.useoptic.proxy.collection.url.URLParser

import scala.util.Try

object BuildAPISpec {
  def fromInteractions(apInteractions: Vector[APIInteraction], opticAPIConfiguration: OpticAPIConfiguration) = {

    val matchResults = apInteractions.map {case interaction => (interaction, URLParser.parse(interaction.request.fullPath, opticAPIConfiguration.paths))}
    val (unmatched, matched) = matchResults.partition(_._2.isLeft) //handle these with issues later

    matched.map {
      case (APIInteraction(request, response), Right(path)) => Try {
        val pathIssues = scala.collection.mutable.ListBuffer[Exception]()

        val queryParameters = QueryParser.parseQuery(request.fullPath)

        val requestBody = {
          if (request.contentType.isDefined && request.bodyBase64.isDefined) {
            val bodyParse = BodyParser.parse(request.contentType.get, request.contentType.get)
            if (bodyParse.isSuccess) bodyParse.toOption else {
              pathIssues.append(bodyParse.failed.get.asInstanceOf[Exception])
              None
            }
          } else None
        }

        val headers = HeaderParser.parseHeaders(request.headers)


      }
    }


  }
}

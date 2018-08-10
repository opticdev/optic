package com.opticdev.cli.commands

import akka.http.scaladsl.Http
import akka.http.scaladsl.model.Uri.Query
import akka.http.scaladsl.model._
import akka.http.scaladsl.unmarshalling.Unmarshal
import better.files.File
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.Try

object Publish {
  def publish(cd: File): Future[String] = {

    val params = Map("directory" -> cd.pathAsString)
    val request = HttpRequest(uri = Uri(baseUrl + "/cli/publish").withQuery(Query(params))).withMethod(HttpMethods.PUT)

    Http().singleRequest(request).map(response=> {
      if (response.status == StatusCode.int2StatusCode(200)) {
        Unmarshal(response.entity).to[String].map(body=> body)
      } else {
        Future("")
      }
    }).flatten

  }
}

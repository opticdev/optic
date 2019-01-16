package com.useoptic.proxy.services.proxy

import akka.http.scaladsl.model.{HttpRequest, HttpResponse}
import com.useoptic.proxy.collection.{RawRequest, RawResponse}

object HttpResponseImplicits {
  implicit class HttpResponseHelper(httpResponse: HttpResponse) {


    def toOpticResponse: RawResponse = {

      val status = httpResponse.status.intValue()

      val body = if (httpResponse.entity.isKnownEmpty()) {
        None
      } else {
        Some(httpResponse.entity)
      }

      val headers = httpResponse.headers.map(i => {
        i.name() -> i.value()
      })

      RawResponse(status, headers.toVector, body)
    }

  }
}

package com.useoptic.proxy.services.proxy

import akka.http.scaladsl.model.{HttpMethods, HttpRequest, Uri}
import org.scalatest.FunSpec

class HttpRequestHelperSpec extends FunSpec {
  import HttpRequestImplicits._

  it("can update host") {
    val result = HttpRequest(HttpMethods.POST, Uri.apply("https://localhost:8080/me/you?them=a"))
      .updateHost("dev.mycom", 2020)

    assert(result.uri.toString() == "https://dev.mycom:2020/me/you?them=a")
  }

}

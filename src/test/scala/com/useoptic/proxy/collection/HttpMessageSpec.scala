package com.useoptic.proxy.collection

import org.scalatest.FunSpec

class HttpMessageSpec extends FunSpec {

  describe("content type classification") {
     it("can determine the content-type from headers") {
       val message = new HTTPTransaction {
         override def headers: Vector[(String, String)] = Vector("Content-type" -> "application/json")
         override def bodyBase64: Option[String] = None
       }
       assert(message.contentType.get == "application/json")
     }

     it("returns None if missing") {
       val message = new HTTPTransaction {override def headers: Vector[(String, String)] = Vector()
         override def bodyBase64: Option[String] = None
       }
       assert(message.contentType.isEmpty)
     }
  }

}

package com.opticdev.sdk.transformation

import com.opticdev.sdk.descriptions.transformation.{Inflate, TransformFunction}
import org.scalatest.FunSpec
import play.api.libs.json.{JsObject, JsString}

import scala.util.Success

class InflateSpec extends FunSpec {
  describe("Transform Function") {

    val valid =
      """
        |function(a) {
        | return {hello: a.test}
        |}
      """.stripMargin

    it("can inflate code to script objects") {
      val inflated = Inflate.fromString(valid)
      assert(inflated.isSuccess)
    }

    it("will fail code it is not syntactically valid") {
      assert(Inflate.fromString("_dasd dd+( ").isFailure)
    }

    it("will fail it is not a function ") {
      assert(Inflate.fromString("'Hello World'").isFailure)
    }
  }
}

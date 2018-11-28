package com.opticdev.sdk.skills_sdk.lens

import org.scalatest.FunSpec
import play.api.libs.json.{JsError, Json}

class OMLensAssignmentComponentSpec extends FunSpec {

  describe("parsing") {
    val example = """{"tokenAt":{"astType":"Identifier","range":{"start":18,"end":25}},"keyPath":"parameters","abstraction":"optic:express/handler"}"""

    it("can parse as self") {
      import com.opticdev.sdk.skills_sdk.Serialization.omlensassignmentcomponentFormats
      val result = Json.fromJson[OMLensAssignmentComponent](Json.parse(example))
      assert(result.isSuccess)
    }

    it("can parse") {
      import com.opticdev.sdk.skills_sdk.Serialization.omlenscomponentFormat
      val result = Json.fromJson[OMLensComponent](Json.parse(example))
      assert(result.isSuccess)
    }
  }

}

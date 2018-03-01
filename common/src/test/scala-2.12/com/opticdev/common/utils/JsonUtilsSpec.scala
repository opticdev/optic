package com.opticdev.common.utils

import org.scalatest.FunSpec
import play.api.libs.json.{JsArray, JsBoolean, JsObject, JsString}

class JsonUtilsSpec extends FunSpec {

  describe("Remove reserved fields") {

    it("removes reserved fields from JsObjects") {

      val test = JsObject(Seq("one" -> JsBoolean(false), "_order" -> JsArray()))

      assert(JsonUtils.removeReservedFields(test) == JsObject(Seq("one" -> JsBoolean(false))))
    }

    it("removes reserved fields from JsObjects recursively") {

      val test = JsObject(Seq("one" -> JsBoolean(false), "_order" -> JsArray(), "test" -> JsObject(
        Seq("go" -> JsString("value"), "_reserved_key" -> JsString("HERE"))
      )))

      assert(JsonUtils.removeReservedFields(test) == JsObject(Seq("one" -> JsBoolean(false), "test" -> JsObject(
        Seq("go" -> JsString("value"))
      ))))
    }

  }

}

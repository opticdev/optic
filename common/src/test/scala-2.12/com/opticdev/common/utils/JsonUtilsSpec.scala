package com.opticdev.common.utils

import org.scalatest.FunSpec
import play.api.libs.json._

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

  describe("Filter paths") {

    //is an integer & is even
    val predicate = (a: JsValue) => a match {
      case JsNumber(n) => n%2==0
      case _ => false
    }

    it("can find the paths that match a predicate in the root object") {

      val source = JsObject(Seq(
        "one" -> JsNumber(1),
        "two" -> JsNumber(2),
        "three" -> JsString("three"),
        "four" -> JsNumber(4)
      ))

      val result = JsonUtils.filterPaths(source, predicate)

      result == Set(
        Seq("two"),
        Seq("four")
      )

    }

    it("can find nested paths that match a predicate") {
      val source = JsObject(
          Seq("secondLevel" -> JsObject(
          Seq("thirdLevel" -> JsObject(
          Seq(
          "one" -> JsNumber(1),
          "two" -> JsNumber(2),
          "three" -> JsString("three"),
          "four" -> JsNumber(4)
      ))))))

      val result = JsonUtils.filterPaths(source, predicate, true)

      result == Set(
        Seq("secondLevel", "thirdLevel", "two"),
        Seq("secondLevel", "thirdLevel", "four")
      )

    }

    it("will not find nested paths if deep is=false") {
      val source = JsObject(
        Seq("secondLevel" -> JsObject(
          Seq("thirdLevel" -> JsObject(
            Seq(
              "one" -> JsNumber(1),
              "two" -> JsNumber(2),
              "three" -> JsString("three"),
              "four" -> JsNumber(4)
            ))))))

      val result = JsonUtils.filterPaths(source, predicate, false)

      result == Set()

    }

  }


}

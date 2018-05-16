package com.opticdev.sdk

import com.opticdev.sdk.descriptions.transformation.StagedNode
import org.scalatest.FunSpec

class RenderOptionsSpec extends FunSpec {

  describe("parsing") {

  }

  //None + Some(Value) = Some(Value)
  //Some(Value) + None = Some(Value)
  //Some(Value) + Some(Value1) = Some(Value1)
  //Map + None = Map
  //Map + Map1 = Map + Map1
  describe("merging") {

    describe("lensIds") {

      it("will not overwrite a value with None") {
        val merged = RenderOptions(lensId = Some("ABC")).mergeWith(RenderOptions())
        assert(merged.lensId.get == "ABC")
      }

      it("will replace existing value with new value") {
        val merged = RenderOptions(lensId = Some("ABC")).mergeWith(RenderOptions(lensId = Some("abc")))
        assert(merged.lensId.get == "abc")
      }

      it("will replace None with new value") {
        val merged = RenderOptions().mergeWith(RenderOptions(lensId = Some("abc")))
        assert(merged.lensId.get == "abc")
      }

    }

    describe("tags") {

      it("will not overwrite a value with None") {
        val merged = RenderOptions(tag = Some("ABC")).mergeWith(RenderOptions())
        assert(merged.tag.get == "ABC")
      }

      it("will replace existing value with new value") {
        val merged = RenderOptions(tag = Some("ABC")).mergeWith(RenderOptions(tag = Some("abc")))
        assert(merged.tag.get == "abc")
      }

      it("will replace None with new value") {
        val merged = RenderOptions().mergeWith(RenderOptions(tag = Some("abc")))
        assert(merged.tag.get == "abc")
      }

    }

    describe("container contents") {
      it("will not overwrite a value with None") {
        val merged = RenderOptions(containers = Some(Map("value" -> Seq.empty))).mergeWith(RenderOptions())
        assert(merged.containers.contains(Map("value" -> Seq.empty[StagedNode])))
      }

      it("will replace None with new value") {
        val merged = RenderOptions().mergeWith(RenderOptions(containers = Some(Map("value1" -> Seq.empty))))
        assert(merged.containers.get.size == 1)
      }

      it("will merge existing values") {
        val merged = RenderOptions(containers = Some(Map("value" -> Seq.empty))).mergeWith(RenderOptions(containers = Some(Map("value1" -> Seq.empty))))
        assert(merged.containers.get.size == 2)
      }
    }

    describe("variable contents") {
      it("will not overwrite a value with None") {
        val merged = RenderOptions(variables = Some(Map("value" -> "test"))).mergeWith(RenderOptions())
        assert(merged.variables.contains(Map("value" -> "test")))
      }

      it("will replace None with new value") {
        val merged = RenderOptions().mergeWith(RenderOptions(variables = Some(Map("value1" -> "test"))))
        assert(merged.variables.get.size == 1)
      }

      it("will merge existing values") {
        val merged = RenderOptions(variables = Some(Map("value" -> "test"))).mergeWith(RenderOptions(variables = Some(Map("value1" -> "test"))))
        assert(merged.variables.get.size == 2)
      }
    }

  }

}

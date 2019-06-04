package com.seamless.contexts.data_types

import com.seamless.contexts.data_types.Primitives.{ObjectT, StringT}
import org.scalatest.FunSpec

class ShapeDescriptionSpec extends FunSpec {

  describe("transitions") {

    it("from has fields to primitive") {
      val obj = ShapeDescription(ObjectT, "parent", "id", None, Some(Seq("a", "b", "c")), None)
      val asString = obj.updateType(StringT)
      assert(asString.fields.isEmpty)

      val backToObject = asString.updateType(ObjectT, Seq("a", "b", "c"))

      assert(backToObject.fields.isDefined)
      assert(backToObject == obj)

    }

  }


}

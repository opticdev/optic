package com.opticdev.core.debug

import better.files.File
import com.opticdev.core.Fixture.TestBase
import com.opticdev.opm.TestPackageProviders
import com.opticdev.opm.packages.{OpticMDPackage, OpticPackage}
import org.scalatest.FunSpec
import play.api.libs.json.{JsNumber, JsObject, JsString}

class OpticMDPackageRangeImplicitsSpec extends TestBase with TestPackageProviders {

  describe("JSObject Package Exportable Implicits") {
    import com.opticdev.core.debug.OpticMDPackageRangeImplicits.JsObjectPackageExportable

    it("will not find a range if none") {
      assert(JsObject.empty.rangeIfExists.isEmpty)
    }

    it("will find a range if present") {
      val input = JsObject(Seq("other" -> JsString("ABC"),
        "range" -> JsObject(Seq("start" -> JsNumber(12), "end" -> JsNumber(291)))))

      assert(input.rangeIfExists.contains(Range(12, 291)))
    }
  }

  describe("OpticMDPackage Range Implicits") {
    lazy val testPackage = OpticPackage.fromMarkdown(File("test-examples/resources/example_markdown/Mongoose.md")).get.resolved()
    import OpticMDPackageRangeImplicits.OpticMDPackageWrapper

    it("returns range of schema") {
      assert(testPackage.rangeOfSchema(testPackage.schemas.head).isDefined)
    }

    it("returns range of lens") {
      assert(testPackage.rangeOfLens(testPackage.lenses.head).isDefined)
    }

  }

}

package com.opticdev.core.sourcegear.annotations

import com.opticdev.common.PackageRef
import com.opticdev.core.Fixture.TestBase
import com.opticdev.common.graph.CommonAstNode
import com.opticdev.parsers.SourceParserManager
import com.opticdev.common.SchemaRef
import com.opticdev.sdk.descriptions.transformation.TransformationRef
import org.scalatest.FunSpec
import play.api.libs.json.{JsNumber, JsObject, JsString}

import scala.util.Try

class AnnotationParserSpec extends TestBase {

  describe("extracting comments") {
    it("returns none when no comment found") {
      assert(AnnotationParser.findAnnotationComment("//", "hello.code()").isEmpty)
    }

    it("returns the last comment when found") {
      assert(AnnotationParser.findAnnotationComment("//", "hello.code('//hello') //realone").contains("//realone"))
    }

    it("can find all comments in multiple lines") {

      val a =
        """"
          |
          |
          |
          |
          |"""".stripMargin

    }
  }

}

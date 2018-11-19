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

    it("can find all inline comments in multiple lines") {

      val a =
        """"
          |
          | codeThing() //optic.name = "HELLO"
          |
          | otherThing() //optic.name = "GOODBYE"
          |
          |
          |"""".stripMargin


      val results = AnnotationParser.inlineAnnotationComments("//", a)

      assert(results == Vector(
        (3, """optic.name = "HELLO""""),
        (5, """optic.name = "GOODBYE"""")
      ))

    }

    val blockRegex = "(?:\\/\\*)([\\s\\S]*?)(?:\\*\\/)".r

    val a =
      """"
        |
        | /* Hello World
        |    optic.name = "Hello"
        | */
        |
        | /* Goodbye World
        |    optic.name = "Goodbye"
        | */
        |
        |
        |
        |"""".stripMargin

    it("can find all block comments and assign to the last line + 1") {

      val candidateLines = AnnotationParser.findBlockAnnotationComments(blockRegex, a)
      assert(candidateLines == Vector(
        (6, "Hello World"),
        (6, """optic.name = "Hello""""),
        (10, "Goodbye World"),
        (10, """optic.name = "Goodbye""""),
      ))

    }

    it("can find all valid annotations from blocks") {
      val annotations = AnnotationParser.annotationsFromFile(a)(SourceParserManager.installedParsers.head, null)
      assert(annotations == Vector((6, NameAnnotation("Hello", null)), (10, NameAnnotation("Goodbye", null))))
    }

  }

}

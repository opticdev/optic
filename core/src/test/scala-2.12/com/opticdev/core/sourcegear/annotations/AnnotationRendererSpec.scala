package com.opticdev.core.sourcegear.annotations

import better.files.File
import com.opticdev.common.PackageRef
import com.opticdev.common.SchemaRef
import com.opticdev.core.Fixture.TestBase
import com.opticdev.parsers.SourceParserManager
import com.opticdev.sdk.descriptions.transformation.TransformationRef
import org.scalatest.FunSpec

class AnnotationRendererSpec extends TestBase {

  val prefix = "//"
  val testSchema = SchemaRef(Some(PackageRef("test:package")), "test")

  it("can generate a single annotation") {
    val target = Vector(NameAnnotation("test", null, false))

    val result = AnnotationRenderer.render(prefix, target)
    val parsed = AnnotationParser.annotationsFromFile(result)(SourceParserManager.installedParsers.head, File(""))

    assert(parsed.head._2 == target.head)
  }

  describe("rendering to existing string") {
    val target = Vector(NameAnnotation("test", testSchema, false))
    it("can render to the first line when only one line") {
      val testCode ="testCode()"
      val result = AnnotationRenderer.renderToFirstLine(prefix, target, testCode)
      assert(result == "testCode()  //optic.name = \"test\"")
    }

    it("can render to the first line of a multi-line") {
      val testCode ="testCode()\nIsAwesome()"
      val result = AnnotationRenderer.renderToFirstLine(prefix, target, testCode)
      assert(result == "testCode()  //optic.name = \"test\"\nIsAwesome()")
    }

    it("will render to the first line with contents of a multi-line") {
      val testCode ="\n \n  \ntestCode()\nIsAwesome()"
      val result = AnnotationRenderer.renderToFirstLine(prefix, target, testCode)
      assert(result == "\n \n  \ntestCode()  //optic.name = \"test\"\nIsAwesome()")
    }

    it("doesn't throw on an empty string") {
      val testCode =""
      val result = AnnotationRenderer.renderToFirstLine(prefix, target, testCode)
      assert(result == "  //optic.name = \"test\"")
    }
  }
}

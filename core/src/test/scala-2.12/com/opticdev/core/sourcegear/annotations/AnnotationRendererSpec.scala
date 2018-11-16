package com.opticdev.core.sourcegear.annotations

import com.opticdev.common.PackageRef
import com.opticdev.common.SchemaRef
import com.opticdev.sdk.descriptions.transformation.TransformationRef
import org.scalatest.FunSpec

class AnnotationRendererSpec extends FunSpec {

  val prefix = "//"
  val testSchema = SchemaRef(Some(PackageRef("test:package")), "test")

  it("can generate a single annotation") {
    val target = Vector(NameAnnotation("test", testSchema))

    val result = AnnotationRenderer.render(prefix, target)
    val parsed = AnnotationParser.extract(result, testSchema, prefix)(null)

    assert(parsed == target.toSet)
  }

  it("can generate a multiple annotations") {
    val target = Vector(NameAnnotation("test", testSchema), SourceAnnotation("other", TransformationRef(Some(PackageRef("optic:test")), "transform"), None))

    val result = AnnotationRenderer.render(prefix, target)
    val parsed = AnnotationParser.extract(result, testSchema, prefix)(null)

    assert(parsed == target.toSet)
  }


  describe("rendering to existing string") {
    val target = Vector(NameAnnotation("test", testSchema))
    it("can render to the first line when only one line") {
      val testCode ="testCode()"
      val result = AnnotationRenderer.renderToFirstLine(prefix, target, testCode)
      assert(result == "testCode()  //name: test")
    }

    it("can render to the first line of a multi-line") {
      val testCode ="testCode()\nIsAwesome()"
      val result = AnnotationRenderer.renderToFirstLine(prefix, target, testCode)
      assert(result == "testCode()  //name: test\nIsAwesome()")
    }

    it("will render to the first line with contents of a multi-line") {
      val testCode ="\n \n  \ntestCode()\nIsAwesome()"
      val result = AnnotationRenderer.renderToFirstLine(prefix, target, testCode)
      assert(result == "\n \n  \ntestCode()  //name: test\nIsAwesome()")
    }

    it("doesn't throw on an empty string") {
      val testCode =""
      val result = AnnotationRenderer.renderToFirstLine(prefix, target, testCode)
      assert(result == "  //name: test")
    }
  }
}

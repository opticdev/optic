package com.opticdev.core.utils

import better.files.File
import com.opticdev.common.graph.CommonAstNode
import org.scalatest.PrivateMethodTester
import com.opticdev.common.utils.RangeToLine._
import com.opticdev.core.Fixture.AkkaTestFixture
import com.opticdev.core.Fixture.compilerUtils.{GearUtils, ParserUtils}
import com.opticdev.core.sourcegear.actors.ParseSupervisorSyncAccess
import com.opticdev.core.sourcegear.annotations.TagAnnotation
import com.opticdev.core.sourcegear.graph.model.ModelNode
import com.opticdev.core.sourcegear.project.StaticSGProject
import play.api.libs.json.{JsObject, JsString}

class RangeToLineSpec extends AkkaTestFixture("MutateSpec") with PrivateMethodTester with GearUtils with ParserUtils {
val testBody =
  """
    |
    |
    |Hello World
    |
    |I am Optic
    |
    |
    |
  """.stripMargin

  it("gets range from chars on same line") {
    val helloWorldRange = Range(testBody.indexOf("H"), testBody.indexOf("d"))
    val r = helloWorldRange.toLineRange(testBody)
    assert((r.start, r.end) == (4,4))
  }

  it("handles multi line range ") {
    val helloWorldRange = Range(testBody.indexOf("H"), testBody.indexOf("c"))
    val r = helloWorldRange.toLineRange(testBody)
    assert((r.start, r.end) == (4,6))
  }


  def fixture1 = new {
    val file = File("test-examples/resources/example_source/BunchOfParameters.js")
    implicit val fileContents = file.contentAsString
    val sourceGear = sourceGearFromDescription("test-examples/resources/example_packages/optic:FlatExpress_non_distinct_params@0.1.0.json")
    implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/example_source/"), sourceGear)
    val parseResult = sourceGear.parseFile(file)
  }

  it("handles multiple lines properly") {
    val f = fixture1
    val fileAnnotations = f.parseResult.get.fileAnnotations

    assert(fileAnnotations.size == 5)
  }

  def fixture2 = new {
    val file = File("test-examples/resources/example_source/ExampleExpressForMutate.js")
    implicit val fileContents = file.contentAsString
    val sourceGear = sourceGearFromDescription("test-examples/resources/example_packages/optic:FlatExpress_non_distinct_params@0.1.0.json")
    implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/example_source/"), sourceGear)
    val parseResult = sourceGear.parseFile(file)
  }

  it("handles a real world example") {
    val f = fixture2
    val modelNodes = f.parseResult.get.modelNodes
    val fileAnnotations = f.parseResult.get.fileAnnotations

    def findNodeFor(id: String, valuePred: JsObject => Boolean) = {
      modelNodes.find(i=> i.schemaId.id == id && valuePred(i.value)).map(i=> (i, i.asInstanceOf[ModelNode].resolveInGraph[CommonAstNode](f.parseResult.get.astGraph).root))
    }

    val innerRoute1 = findNodeFor("route", (value) => value.value("url").as[JsString].value == "suburl")
    val innerRoute2 = findNodeFor("route", (value) => value.value("url").as[JsString].value == "suburl2")

    assert(fileAnnotations(innerRoute1.get._1.asInstanceOf[ModelNode]).head.asInstanceOf[TagAnnotation].tag == "sub")
    assert(fileAnnotations(innerRoute2.get._1.asInstanceOf[ModelNode]).head.asInstanceOf[TagAnnotation].tag == "subTwo")
  }

}

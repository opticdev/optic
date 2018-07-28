package com.opticdev.core.languages

import better.files.File
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.Fixture.compilerUtils.GearUtils
import com.opticdev.core.sourcegear.project.ProjectBase
import com.opticdev.core.sourcegear.{Render, SGConstructor}
import com.opticdev.opm.packages.{OpticMDPackage, OpticPackage}
import com.opticdev.parsers.SourceParserManager
import org.scalatest.{BeforeAndAfterAll, FunSpec}
import play.api.libs.json.{JsObject, JsString}

class ScalaSpec extends TestBase with GearUtils with BeforeAndAfterAll {

  implicit val languageName: String = "scala"
  implicit val project: ProjectBase = null

  override def beforeAll: Unit = {
    SourceParserManager.enableParser(new com.opticdev.parsers.scala.OpticParser)
    super.beforeAll
  }

  it("can find the scala parser") {
    assert(SourceParserManager.parserByLanguageName("scala").isDefined)
  }

  lazy val scalaPackage = OpticPackage.fromMarkdown(File("test-examples/resources/example_markdown/scala/TestScala.md")).get.resolved(Map())
  lazy val sg = sourceGearFromPackage(scalaPackage)

  it("can parse scala code into model") {
    val found = sg.parseString("val name = me").get.modelNodes.head
    assert(found.value == JsObject(Seq("definedAs" -> JsString("name"), "value" -> JsString("me"))))
  }

  it("can generate scala code") {
    val generated = Render.simpleNode(sg.lensSet.listLenses.head.schemaRef,
      JsObject(Seq("definedAs" -> JsString("abcdefg"), "value" -> JsString("hijklmnop"))))(sg)
      .get

    assert(generated._2 == "val abcdefg = hijklmnop")
  }



}

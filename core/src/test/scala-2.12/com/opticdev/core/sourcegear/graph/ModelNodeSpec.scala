package com.opticdev.core.sourcegear.graph

import better.files.File
import com.opticdev.core.Fixture.AkkaTestFixture
import com.opticdev.core.Fixture.compilerUtils.GearUtils
import com.opticdev.core.sourcegear.{GearSet, SourceGear}
import com.opticdev.core.sourcegear.graph.enums.AstPropertyRelationship
import com.opticdev.core.sourcegear.graph.model.Path
import com.opticdev.core.sourcegear.project.{Project, StaticSGProject}
import com.opticdev.parsers.{ParserBase, SourceParserManager}
import play.api.libs.json.{JsObject, JsString}

import scalax.collection.mutable.Graph

class ModelNodeSpec extends AkkaTestFixture("ModelNodeTest") with GearUtils {

  override val sourceGear = new SourceGear {
    override val parsers: Set[ParserBase] = SourceParserManager.installedParsers
    override val gearSet = new GearSet()
    override val schemas = Set()
  }

  val testFilePath = getCurrentDirectory + "/test-examples/resources/example_source/ImportSource.js"

  val projectGraphWrapper = new ProjectGraphWrapper(Graph())
  implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/example_source/"), sourceGear) {
    override def projectGraph = projectGraphWrapper.projectGraph
    override def projectSourcegear: SourceGear = sourceGear
  }

  val importResults = {
    val importGear = gearFromDescription("test-examples/resources/example_packages/optic:ImportExample@0.1.0.json")
    sourceGear.gearSet.addGear(importGear)
    sourceGear.parseFile(File(testFilePath))
  }

  projectGraphWrapper.addFile(importResults.get.astGraph, File(testFilePath))

  it("can resolve when flat") {

    val helloWorldImport = importResults.get.modelNodes.find(i=> (i.value \ "pathTo").get == JsString("world")).get
    val resolved = helloWorldImport.resolve
    val resolvedMapping = resolved.mapping

    assert(resolvedMapping.size == 2)
    assert(resolvedMapping.get(Path("definedAs")).get.relationship == AstPropertyRelationship.Token)
    assert(resolvedMapping.get(Path("pathTo")).get.relationship == AstPropertyRelationship.Literal)

  }

  describe("Mutation") {

    val helloWorldImport = importResults.get.modelNodes.find(i=> (i.value \ "pathTo").get == JsString("world")).get

    it("Can mutate a token") {
      val resolved = helloWorldImport.resolve
      import com.opticdev.core.sourcegear.mutate.MutationImplicits._
      implicit val fileContents = File(testFilePath).contentAsString
      val result = resolved.update(JsObject(Seq("definedAs" -> JsString("goodbye"), "pathTo" -> JsString("local"))))
      assert(result.toString == "let goodbye = require('local')\n\nfunction test () {\n    let nextOne = require(\"PIZZA!\")\n}")
    }

  }

}

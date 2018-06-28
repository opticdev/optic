package com.opticdev.core.sourcegear.graph

import better.files.File
import com.opticdev.core.Fixture.AkkaTestFixture
import com.opticdev.core.Fixture.compilerUtils.GearUtils
import com.opticdev.core.sourcegear.context.FlatContext
import com.opticdev.core.sourcegear.{LensSet, SourceGear}
import com.opticdev.core.sourcegear.graph.enums.AstPropertyRelationship
import com.opticdev.core.sourcegear.graph.model.{ModelNode, Path}
import com.opticdev.core.sourcegear.project.{Project, StaticSGProject}
import com.opticdev.parsers.graph.CommonAstNode
import com.opticdev.parsers.{ParserBase, SourceParserManager}
import play.api.libs.json.{JsObject, JsString}
import scalax.collection.mutable.Graph

class ModelNodeSpec extends AkkaTestFixture("ModelNodeTest") with GearUtils {

  def fixture = new {
    val sourceGear =
    new SourceGear {
      override val parsers: Set[ParserBase] = SourceParserManager.installedParsers
      override val lensSet = new LensSet()
      override val schemas = Set()
      override val transformations = Set()
      override val flatContext: FlatContext = FlatContext(None, Map.empty)
    }

    val testFilePath = getCurrentDirectory + "/test-examples/resources/example_source/ImportSource.js"

    var pgW: ProjectGraphWrapper = null
    implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/example_source/"), sourceGear) {
      pgW = new ProjectGraphWrapper(Graph())(this)

      override def projectGraph = pgW.projectGraph

      override def projectSourcegear: SourceGear = sourceGear
    }

    val importResults = {
      val importGear = compiledLensFromDescription("test-examples/resources/example_packages/optic:ImportExample@0.1.0.json")
      sourceGear.lensSet.addLens(importGear)
      sourceGear.parseFile(File(testFilePath))
    }

    pgW.addFile(importResults.get.astGraph, File(testFilePath))

  }

  it("can resolve when flat") {

    val f = fixture
    implicit val sourceGear = f.sourceGear
    implicit val project = f.project

    val a = f.importResults

    val helloWorldImport = f.importResults.get.modelNodes.find(i=> (i.value \ "pathTo").get == JsString("world")).get.asInstanceOf[ModelNode]
    val resolved = helloWorldImport.resolve
    val resolvedMapping = resolved.modelMapping

    assert(resolvedMapping.size == 2)
    assert(resolvedMapping(Path.fromString("definedAs")).head.relationship == AstPropertyRelationship.Token)
    assert(resolvedMapping(Path.fromString("pathTo")).head.relationship == AstPropertyRelationship.Literal)

  }

  describe("Mutation") {

    it("Can mutate a token") {

      val f = fixture
      implicit val sourceGear = f.sourceGear
      implicit val project = f.project

      val helloWorldImport = f.importResults.get.modelNodes.find(i=> (i.value \ "pathTo").get == JsString("world")).get.asInstanceOf[ModelNode]


      val resolved = helloWorldImport.resolve[CommonAstNode]
      import com.opticdev.core.sourcegear.mutate.MutationImplicits._
      implicit val fileContents = File(f.testFilePath).contentAsString
      val result = resolved.update(JsObject(Seq("definedAs" -> JsString("goodbye"), "pathTo" -> JsString("local"))))

      assert(result.toString == "let goodbye = require('local')\n\nfunction test () {\n    let nextOne = require(\"PIZZA!\")\n}")
    }

  }

}

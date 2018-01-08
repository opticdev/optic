package com.opticdev.core.sourcegear.mutate

import better.files.File
import com.opticdev.core.Fixture.AkkaTestFixture
import com.opticdev.core.Fixture.compilerUtils.GearUtils
import com.opticdev.sdk.descriptions.CodeComponent
import com.opticdev.sdk.descriptions.enums.ComponentEnums.Literal
import com.opticdev.core.sourcegear.{GearSet, SourceGear}
import com.opticdev.core.sourcegear.graph.ProjectGraphWrapper
import com.opticdev.core.sourcegear.graph.enums.AstPropertyRelationship
import com.opticdev.core.sourcegear.mutate.MutationSteps._
import com.opticdev.core.sourcegear.project.{Project, StaticSGProject}
import com.opticdev.parsers.{ParserBase, SourceParserManager}
import play.api.libs.json.{JsObject, JsString}

import scalax.collection.mutable.Graph

class MutationStepsSpec extends AkkaTestFixture("MutationStepsTest") with GearUtils {

  override val sourceGear = new SourceGear {
    override val parsers: Set[ParserBase] = SourceParserManager.installedParsers
    override val gearSet = new GearSet()
    override val schemas = Set()
  }

  val projectGraphWrapper = new ProjectGraphWrapper(Graph())

  implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), sourceGear) {
    override def projectGraph = projectGraphWrapper.projectGraph
    override def projectSourcegear: SourceGear = sourceGear

  }

  val testFilePath = getCurrentDirectory + "/test-examples/resources/example_source/ImportSource.js"

  val importResults = {
    val importGear = gearFromDescription("test-examples/resources/example_packages/optic:ImportExample@0.1.0.json")
    sourceGear.gearSet.addGear(importGear)
    sourceGear.parseFile(File(testFilePath))
  }

  projectGraphWrapper.addFile(importResults.get.astGraph, File(testFilePath))

  val helloWorldImport = importResults.get.modelNodes.find(i=> (i.value \ "pathTo").get == JsString("world")).get
  val resolved = helloWorldImport.resolve

  implicit val fileContents = File(testFilePath).contentAsString

  describe("collect changes") {
    it("can collect changes") {
      val changes = collectChanges(resolved, JsObject(Seq("definedAs" -> JsString("hello"), "pathTo" -> JsString("CHANGED"))))
      assert(changes.size == 1)
      assert(changes.head.get.component.propertyPath == "pathTo")
      assert(changes.head.get.component.asInstanceOf[CodeComponent].codeType == Literal)
    }

    it("doesn't calculate a diff for same properties") {
      val changes = collectChanges(resolved, resolved.value)
      assert(changes.isEmpty)
    }

  }

  describe("handle changes") {
    val changes = collectChanges(resolved, JsObject(Seq("definedAs" -> JsString("DIFFERENT"), "pathTo" -> JsString("CHANGED")))).map(_.get)
    it("generates AST changes") {
      val astChanges = handleChanges(changes)
      assert(astChanges.find(_.mapping.relationship == AstPropertyRelationship.Literal).get.replacementString.get == "'CHANGED'")
      assert(astChanges.find(_.mapping.relationship == AstPropertyRelationship.Token).get.replacementString.get == "DIFFERENT")
    }

  }

  describe("combine changes") {
    it("Combines changes in reverse to avoid range conflicts") {
      val changes = collectChanges(resolved, JsObject(Seq("definedAs" -> JsString("DIFFERENT"), "pathTo" -> JsString("CHANGED")))).map(_.get)
      val astChanges = handleChanges(changes)
      assert(combineChanges(astChanges).toString == "let DIFFERENT = require('CHANGED')\n\nfunction test () {\n    let nextOne = require(\"PIZZA!\")\n}")
    }
  }

}

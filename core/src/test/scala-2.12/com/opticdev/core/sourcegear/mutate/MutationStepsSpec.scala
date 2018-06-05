package com.opticdev.core.sourcegear.mutate

import better.files.File
import com.opticdev.core.Fixture.{AkkaTestFixture, ExampleSourcegearFixtures}
import com.opticdev.core.Fixture.ExampleSourcegearFixtures.routeQueryResponse
import com.opticdev.core.Fixture.compilerUtils.GearUtils
import com.opticdev.core.sourcegear.actors.{ParseSupervisorSyncAccess, ProjectActorSyncAccess}
import com.opticdev.sdk.descriptions.CodeComponent
import com.opticdev.core.sourcegear.{LensSet, Render, SourceGear}
import com.opticdev.core.sourcegear.graph.{ProjectGraph, ProjectGraphWrapper}
import com.opticdev.core.sourcegear.graph.enums.AstPropertyRelationship
import com.opticdev.core.sourcegear.graph.model.LinkedModelNode
import com.opticdev.core.sourcegear.mutate.MutationSteps._
import com.opticdev.core.sourcegear.project.{Project, StaticSGProject}
import com.opticdev.parsers.graph.CommonAstNode
import com.opticdev.parsers.{ParserBase, SourceParserManager}
import com.opticdev.sdk.RenderOptions
import com.opticdev.sdk.descriptions.enums.Literal
import com.opticdev.sdk.descriptions.transformation.StagedNode
import play.api.libs.json.{JsArray, JsObject, JsString}
import scalax.collection.mutable.Graph

class MutationStepsSpec extends AkkaTestFixture("MutationStepsTest") with GearUtils {

  def fixture = new {
    val sourceGear = sourceGearFromDescription("test-examples/resources/example_packages/optic:ImportExample@0.1.0.json")

    var pgW : ProjectGraphWrapper = null

    implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), sourceGear) {
      pgW = new ProjectGraphWrapper(Graph())(project = this)
      override def projectGraph: ProjectGraph = {
        println(pgW.projectGraph)
        pgW.projectGraph
      }
      override def projectSourcegear: SourceGear = sourceGear

    }

    lazy val testFilePath = getCurrentDirectory + "/test-examples/resources/example_source/ImportSource.js"

    lazy val importResults = sourceGear.parseFile(File(testFilePath))
    pgW.addFile(importResults.get.astGraph, File(testFilePath))

    lazy val helloWorldImport = importResults.get.modelNodes.find(i=> (i.value \ "pathTo").get == JsString("world")).get
    lazy val resolved: LinkedModelNode[CommonAstNode] = helloWorldImport.resolve[CommonAstNode]

    implicit val fileContents = File(testFilePath).contentAsString

  }

  describe("direct source interface changes") {

    describe("collect changes") {
      it("can collect changes") {
        val f = fixture
        implicit val fileContents = f.fileContents
        val changes = collectFieldChanges(f.resolved, JsObject(Seq("definedAs" -> JsString("hello"), "pathTo" -> JsString("CHANGED"))))
        assert(changes.size == 1)
        assert(changes.head.get.component.propertyPath == Seq("pathTo"))
        assert(changes.head.get.component.asInstanceOf[CodeComponent].componentType == Literal)
      }

      it("doesn't calculate a diff for same properties") {
        val f = fixture
        implicit val fileContents = f.fileContents
        val changes = collectFieldChanges(f.resolved, f.resolved.value)
        assert(changes.isEmpty)
      }

    }

    describe("handle changes") {
      lazy val f = fixture
      lazy val changes = collectFieldChanges(f.resolved, JsObject(Seq("definedAs" -> JsString("DIFFERENT"), "pathTo" -> JsString("CHANGED")))).map(_.get)
      it("generates AST changes") {
        implicit val fileContents = f.fileContents
        val astChanges = handleChanges(changes, List())
        assert(astChanges.find(_.mapping.relationship == AstPropertyRelationship.Literal).get.replacementString.get == "'CHANGED'")
        assert(astChanges.find(_.mapping.relationship == AstPropertyRelationship.Token).get.replacementString.get == "DIFFERENT")
      }

    }

    describe("combine changes") {
      it("Combines changes in reverse to avoid range conflicts") {
        val f = fixture
        implicit val fileContents = f.fileContents
        val changes = collectFieldChanges(f.resolved, JsObject(Seq("definedAs" -> JsString("DIFFERENT"), "pathTo" -> JsString("CHANGED")))).map(_.get)
        val astChanges = handleChanges(changes, List())
        assert(combineChanges(astChanges).toString == "let DIFFERENT = require('CHANGED')\n\nfunction test () {\n    let nextOne = require(\"PIZZA!\")\n}")
      }
    }
  }

  describe("map schema mappings") {

    def fixture = new {
      val file = File("test-examples/resources/example_source/ExampleExpress.js")
      implicit val fileContents = file.contentAsString
      val sourceGear = sourceGearFromDescription("test-examples/resources/example_packages/optic:FlatExpress_non_distinct_params@0.1.0.json")
      implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/example_source/"), sourceGear)
      val result = sourceGear.parseFile(file)
      project.projectGraphWrapper.addFile(result.get.astGraph, file)

      implicit val sourceGearContext = ParseSupervisorSyncAccess.getContext(file)(project.actorCluster, sourceGear, project).get
      val route = result.get.modelNodes.find(_.lensRef.id == "route").get
      val routeValue = route.expandedValue(false)(sourceGearContext)

      val newRouteValue = {
        val array = (routeValue \ "parameters").get.as[JsArray]
        val withItem = array.append(JsObject(Seq(
          "in" -> JsString("body"),
          "name" -> JsString("newOne")
        ))).append(JsObject(Seq(
          "in" -> JsString("query"),
          "name" -> JsString("oneMore")
        )))

        routeValue + ("parameters" -> withItem) + ("url" -> JsString("differentURL"))
      }
    }

    it("calculates patch") {
      val f = fixture
      implicit val project = f.project
      implicit val sourceGearContext = f.sourceGearContext

      val changes = collectMapSchemaChanges(f.route.resolved(), f.newRouteValue)

      assert(changes.size == 2)
      assert(changes.head.get.newAstNode.forceContent.contains("req.body.newOne"))
      assert(changes.last.get.newAstNode.forceContent.contains("req.query.oneMore"))

      assert(changes.head.get.containerNode == changes.last.get.containerNode)
    }

    it("can apply patch") {
      import MutationImplicits._
      val f = fixture
      implicit val fileContents = f.fileContents
      implicit val project = f.project
      implicit val sourceGearContext = f.sourceGearContext
      val update = f.route.resolved().update(f.newRouteValue)

      assert(update == """app.get('differentURL', function (req, res) {
                         |    req.query.firstLevel
                         |    if (true) {
                         |        req.body.nested
                         |        req.body.nested
                         |        req.header.bob
                         |    }
                         |    req.body.newOne
                         |    req.query.oneMore
                         |})
                         |
                         |req.param.outside""".stripMargin)

    }

    it("will not delete items") {
      import MutationImplicits._
      val f = fixture
      implicit val fileContents = f.fileContents
      implicit val project = f.project
      implicit val sourceGearContext = f.sourceGearContext

      val newRouteValue = {
        f.routeValue + ("parameters" -> JsArray.empty)
      }

      val update = f.route.resolved().update(newRouteValue)

      assert(update == f.fileContents)

    }

  }

}

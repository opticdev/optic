package com.opticdev.core.sourcegear.containers

import better.files.File
import com.opticdev.core.Fixture.{AkkaTestFixture, TestBase}
import com.opticdev.core.Fixture.compilerUtils.{GearUtils, ParserUtils}
import com.opticdev.core.sourcegear.project.StaticSGProject
import com.opticdev.core.sourcegear.{CompiledLens, SGContext}
import com.opticdev.parsers.SourceParserManager
import play.api.libs.json.Json

class ContainerSpec extends AkkaTestFixture("ContainerSpec") with ParserUtils with GearUtils {

  implicit val languageName = "es7"

  def testBlock(fileContents: String)(implicit gearWithSubContainer: CompiledLens) = {
    val parsed = sample(fileContents)
    val astGraph = parsed.astGraph
    val enterOn = parsed.entryChildren.head
    gearWithSubContainer.parser.matches(enterOn)(astGraph, fileContents, sourceGearContext, null)
  }

  describe("Subcontainers") {

    implicit lazy val gearWithSubContainer: CompiledLens = compiledLensFromDescription("test-examples/resources/example_packages/optic:ShowConfirmAlert@0.1.0.json")

    it("can compile") {
      assert(gearWithSubContainer != null)
    }

    it("will include child rules") {
      assert(gearWithSubContainer.parser.rules.flatMap(_._2.map(_.isChildrenRule)).exists(_ == true))
    }

    describe("child rule evaluation") {
      //@todo implement these tests
    }

    it("can parse any content within if true and if false containers") {
      val test =
      """showConfirm('message', (didConfirm)=> {
        |        if (didConfirm) {
        |           whatever = code+Iwant
        |           const freePeople = (go)=> { myfunc(go) }
        |        } else {
        |           hereTo(we.are.free)
        |        }
        |})""".stripMargin

      val result = testBlock(test)

      assert(result.isDefined)
    }

    it("will parse if non-container areas are changed") {
      val test =
        """showConfirm('message', (didConfirm)=> {
          |        if (didConfirm != pizza) {
          |           whatever = code+Iwant
          |        } else {
          |           hereTo(we.are.free)
          |        }
          |})""".stripMargin

      assert(testBlock(test).isEmpty)

    }

    describe("schema mapping") {

      val test =
        """app.get('url', function (req, res, next) {
          |    testing.this.works
          |    req.query.notMe
          |}, function (req, res) {
          |    req.header.me
          |    req.body.first
          |    req.body.second
          |    req.body.first
          |})""".stripMargin


      implicit lazy val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/example_source/"), sourceGear)
      implicit lazy val sourceGear = sourceGearFromDescription("test-examples/resources/example_packages/optic:FlatExpress_container_mapping@0.1.0.json")
      lazy val result = sourceGear.parseString(test)
      implicit lazy val sourceGearContext = SGContext(sourceGear.fileAccumulator, result.get.astGraph, SourceParserManager.installedParsers.head, null, sourceGear, null, null)



      it("only finds schema within proper component") {
        val test =
          """app.get('url', function (req, res, next) {
            |    testing.this.works
            |    req.query.notMe
            |}, function (req, res) {
            |    req.header.me
            |    req.body.first
            |    req.body.second
            |    req.body.first
            |})""".stripMargin

        val expected =
          Json.parse("""
            | { "url": "url", "method": "get", "parameters": [
            |   { "in": "header", "name": "me" },
            |   { "in": "body", "name": "first" },
            |   { "in": "body", "name": "second" }
            | ] }
          """.stripMargin)

        val route = result.get.modelNodes.find(_.schemaId.id == "route").get

        assert(route.expandedValue() == expected)

      }


    }

  }

}

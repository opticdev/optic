package com.opticdev.core.compiler.stages

import com.opticdev.common.PackageRef
import com.opticdev.core.BlankSchema
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.Fixture.compilerUtils.{GearUtils, ParserUtils}
import com.opticdev.core.compiler.SnippetStageOutput
import com.opticdev.core.sourcegear.{CompiledLens, LensSet, Render, SourceGear}
import com.opticdev.core.sourcegear.containers.{ContainerHook, SubContainerManager}
import com.opticdev.core.sourcegear.context.FlatContext
import com.opticdev.core.sourcegear.gears.parsing.{ParseGear, ParseResult}
import com.opticdev.core.sourcegear.variables.VariableManager
import com.opticdev.parsers.{ParserBase, SourceParserManager}
import com.opticdev.parsers.graph.CommonAstNode
import com.opticdev.parsers.rules.{Any, ChildrenRuleTypeEnum}
import com.opticdev.sdk.descriptions._
import com.opticdev.sdk.descriptions.enums.FinderEnums.Containing
import com.opticdev.sdk.descriptions.enums.VariableEnums
import com.opticdev.sdk.descriptions.finders.StringFinder
import com.opticdev.sdk.descriptions.transformation.Transformation
import com.opticdev.sdk.descriptions.transformation.generate.StagedNode
import play.api.libs.json.{JsObject, JsString, Json}

import scala.util.Try

class MultiNodeParserFactorySpec extends TestBase with ParserUtils with GearUtils {

  def fixture = new {
    val snippet = new Snippet("es7", "function greeting() {\n return 'Hello' \n} \n function helloWorld() {\n if (true) { \n //:callback \n } \n return greeting()+' '+'name' \n}")

    val variables = Vector(Variable("greeting", VariableEnums.Scope))

    implicit val lens : Lens = Lens(Some("Example"), "example", BlankSchema, snippet,
      Vector(
        CodeComponent(Seq("greeting"), StringFinder(Containing, "Hello")),
        CodeComponent(Seq("to"), StringFinder(Containing, "name"))
      ),
      variables,
      Vector(
        SubContainer("callback", Vector(), Any, Vector())
      ),
      PackageRef("test:example", "0.1.1"),
      None)
    implicit val variableManager = VariableManager(variables, SourceParserManager.installedParsers.head.identifierNodeDesc)

    val snippetBuilder = new SnippetStage(snippet)
    val snippetOutput = snippetBuilder.run

    implicit val subcontainersManager = new SubContainerManager(lens.subcontainers, snippetOutput.containerMapping)

  }

    //segment components by child
    //one variable manager for entire thing

  it("can extract individual snippets from the user provided one") {
    val f = fixture
    implicit val lens = f.lens
    val childSnippets = new MultiNodeParserFactoryStage(f.snippetOutput).toChildrenSnippetOutputs

    assert(childSnippets.size == 2)
    assert(childSnippets.head.snippet.block == "function greeting() {\n return 'Hello' \n}")
    assert(childSnippets.last.snippet.block == "function helloWorld() {\n if (true) { \n\n } \n return greeting()+' '+'name' \n}")
  }

  it("can segment containers by child") {
    val f = fixture
    implicit val lens = f.lens
    val factory = new MultiNodeParserFactoryStage(f.snippetOutput)
    val containerMappings = factory.containersByChild()

    assert(containerMappings.size == 2)
    assert(containerMappings.head.isEmpty)
    assert(containerMappings.last.nonEmpty && containerMappings.last.head._1 == ContainerHook("callback", Range(38, 51)))

  }

  it("can segment components and rules by child") {
    val f = fixture
    implicit val lens = f.lens
    val factory = new MultiNodeParserFactoryStage(f.snippetOutput)
    val (componentMappings, ruleMappings) = factory.componentsAndRulesByChild()

    assert(componentMappings.size == 2)
    assert(componentMappings.head.head._2.head.propertyPath == Seq("greeting"))
    assert(componentMappings.last.head._2.head.propertyPath == Seq("to"))

    assert(ruleMappings.size == 2)
    assert(ruleMappings.map(_.values.flatten.size) == Vector(2,2))
  }


  def testParse(parser: ParseGear, block: SnippetStageOutput): Option[ParseResult[CommonAstNode]] = {
    parser.matches(block.entryChildren.head, true)(block.astGraph, block.snippet.block, sourceGearContext, null)
  }

  it("can compile to sequence of lenses") {
    val f = fixture
    implicit val lens = f.lens
    val factory = new MultiNodeParserFactoryStage(f.snippetOutput)
    val childLenses: Try[Vector[CompiledLens]] = factory.childLenses

    assert(childLenses.isSuccess)
    assert(childLenses.get.size == 2)


    implicit val sourcegear = new SourceGear {
      override val parsers: Set[ParserBase] = SourceParserManager.installedParsers
      override val transformations: Set[Transformation] = Set()
      override val flatContext: FlatContext = FlatContext(None, Map())
      override val schemas: Set[Schema] = childLenses.get.map(i=> Schema(i.schemaRef, JsObject.empty)).toSet
      override val lensSet: LensSet = new LensSet(childLenses.get:_*)
    }

    {
      val first = childLenses.get.head
      val parsedSample = sample("function greeting() {\n return 'Hello' \n}")
      val parseResult = testParse(first.parser, parsedSample)
      assert(parseResult.isDefined)
      assert(parseResult.get.modelNode.value == Json.parse("""{"greeting": "Hello"}"""))

      val generatedResult = first.renderer.render(Json.parse("""{"greeting": "HEY YOU"}""").as[JsObject])(sourcegear)
      assert(generatedResult == "function greeting() {\n return 'HEY YOU' \n}")
    }

    {
      val second = childLenses.get.last
      val parsedSample = sample("function helloWorld() {\n if (true) \n { \n go() \n } \n return greeting()+' '+'Aidan' \n}")
      val parseResult = testParse(second.parser, parsedSample)

      assert(second.parser.containers.head._2.name == "callback")

      assert(parseResult.isDefined)
      assert(parseResult.get.modelNode.value == Json.parse("""{"to": "Aidan"}"""))

      val generatedResult = second.renderer.render(Json.parse("""{"to": "Human"}""").as[JsObject])(sourcegear)
      assert(generatedResult == "function helloWorld() {\n if (true) {\n \n } \n return greeting()+' '+'Human' \n}")
    }

  }


  describe("mutli-node lenses") {

    lazy val f = fixture
    implicit lazy val lens = f.lens
    lazy val multiNodeLens = new MultiNodeParserFactoryStage(f.snippetOutput).run.multiNodeLens

    lazy val importSG = sourceGearFromDescription("test-examples/resources/example_packages/optic:ImportExample@0.1.0.json")

    lazy implicit val sourcegear = new SourceGear {
      override val parsers: Set[ParserBase] = SourceParserManager.installedParsers
      override val transformations: Set[Transformation] = Set()
      override val flatContext: FlatContext = FlatContext(None, Map(
        "none:none" -> FlatContext(None, Map(
          "example____0" -> multiNodeLens.childLenses.head,
          "example____1" -> multiNodeLens.childLenses.last,
          "example" -> multiNodeLens
        ))
      ) ++ importSG.flatContext.mapping)
      override val schemas: Set[Schema] = importSG.schemas ++ multiNodeLens.childLenses.map(i=> Schema(i.schemaRef, JsObject.empty)).toSet
      override val lensSet: LensSet = new LensSet((multiNodeLens.childLenses ++ importSG.lensSet.listLenses): _*)
    }

    def testBlock(string: String) = {
      sourcegear.lensSet.parseFromGraph(string, sample(string).astGraph, sourceGearContext, null, None)
    }

    describe("parsing") {

      it("can be parsed from an ast graph") {

        val block =
          testBlock(
            """
              |import test from 'package'
              |
              |function greeting() {
              | return "What's UP"
              |}
              |
              |function helloWorld() {
              | if (true) {
              |
              | }
              | return greeting()+' '+'FRIENDO'
              |}
              |
        """.stripMargin)

        val matches = multiNodeLens.parser.findMatches(block.astGraph)

        assert(matches.size == 1)
        assert(matches.head.childrenNodes.map(_.value).foldLeft(JsObject.empty)(_ ++ _) == Json.parse("""{"greeting": "What's UP", "to": "FRIENDO"}"""))

      }

      it("will not parse if required node is missing") {

        val block =
          testBlock(
            """
              |import test from 'package'
              |
              |function helloWorld() {
              | if (true) {
              |
              | }
              |
              | return greeting()+' '+'FRIENDO'
              |}
              |
        """.stripMargin)

        val matches = multiNodeLens.parser.findMatches(block.astGraph)

        assert(matches.isEmpty)

      }

      it("will parse if other items are in between (even models of target type)") {

        val block =
          testBlock(
            """
              |import test from 'package'
              |
              |function greeting() {
              | return "What's UP"
              |}
              |
              |function greeting() {
              | if (true) {
              |
              | }
              |
              | return "SHOULD NOT SEE"
              |}
              |
              |doThing()
              |
              |class GO {
              |  haveFun() {
              |
              |  }
              |}
              |
              |function helloWorld() {
              | if (true) {
              |
              | }
              |
              | return greeting()+' '+'FRIENDO'
              |}
              |
        """.stripMargin)

        val matches = multiNodeLens.parser.findMatches(block.astGraph)

        assert(matches.size == 1)
        assert(matches.head.childrenNodes.map(_.value).foldLeft(JsObject.empty)(_ ++ _) == Json.parse("""{"greeting": "What's UP", "to": "FRIENDO"}"""))

      }

      it("will parse multiple items in the same parent") {

        val block =
          testBlock(
            """
              |import test from 'package'
              |
              |function greeting() {
              | return "What's UP"
              |}
              |
              |function helloWorld() {
              | if (true) {
              |
              | }
              |
              | return greeting()+' '+'FRIENDO'
              |}
              |
              |
              |function greeting() {
              | return "Yo"
              |}
              |
              |function helloWorld() {
              | if (true) {
              |
              | }
              |
              | return greeting()+' '+'Man'
              |}
              |
        """.stripMargin)

        val matches = multiNodeLens.parser.findMatches(block.astGraph)

        assert(matches.size == 2)
        assert(matches.head.childrenNodes.map(_.value).foldLeft(JsObject.empty)(_ ++ _) == Json.parse("""{"greeting": "What's UP", "to": "FRIENDO"}"""))
        assert(matches.last.childrenNodes.map(_.value).foldLeft(JsObject.empty)(_ ++ _) == Json.parse("""{"greeting": "Yo", "to": "Man"}"""))

      }
    }

    describe("rendering") {

      it("can render multi node ") {
        val generated = multiNodeLens.renderer.renderWithNewAstNodes(Json.parse("""{"greeting": "What's UP", "to": "FRIENDO"}""").as[JsObject], Map("callback" -> Seq(
          StagedNode(SchemaRef(Some(PackageRef("optic:importexample")), "js-import"), JsObject(
                    Seq("definedAs" -> JsString("ABC"), "pathTo" -> JsString("DEF"))))
        )))(sourcegear, sourcegear.flatContext)

        assert(generated._2 == "function greeting() {\n return 'What's UP' \n}\n\nfunction helloWorld() {\n if (true) {\n     let ABC = require('DEF')\n } \n return greeting()+' '+'FRIENDO' \n}")
      }
    }

  }
}

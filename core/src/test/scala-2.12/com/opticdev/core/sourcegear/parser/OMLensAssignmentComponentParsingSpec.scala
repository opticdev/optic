package com.opticdev.core.sourcegear.parser

import better.files.File
import com.opticdev.common.SchemaRef
import com.opticdev.core.Fixture.AkkaTestFixture
import com.opticdev.core.Fixture.compilerUtils.ParserUtils
import com.opticdev.core.sourcegear.accumulate.FileAccumulator
import com.opticdev.core.sourcegear.{CompiledLens, LensSet, SGContext, SourceGear}
import com.opticdev.core.sourcegear.context.FlatContext
import com.opticdev.core.sourcegear.gears.parsing.ParseAsModel
import com.opticdev.core.sourcegear.graph.ProjectGraph
import com.opticdev.core.sourcegear.project.StaticSGProject
import com.opticdev.core.sourcegear.token_value.FileTokenRegistry
import com.opticdev.parsers.graph.AstType
import com.opticdev.parsers.tokenvalues.{Internal, TokenRegistryEntry}
import com.opticdev.parsers.{ParserBase, SourceParserManager}
import com.opticdev.sdk.descriptions.enums.FinderEnums.{Containing, Entire}
import com.opticdev.sdk.skills_sdk.SetValue
import com.opticdev.sdk.skills_sdk.lens.{Literal, OMLensAssignmentComponent, OMLensCodeComponent, OMStringFinder}
import play.api.libs.json.{JsObject, JsString, Json}

class OMLensAssignmentComponentParsingSpec extends AkkaTestFixture("ParserGearTest") with ParserUtils {

  implicit val sourceGear = new SourceGear {
    override val parsers: Set[ParserBase] = SourceParserManager.installedParsers
    override val lensSet = new LensSet()
    override val schemas = Set()
    override val transformations = Set()
    override val flatContext: FlatContext = FlatContext(None, Map.empty)
    override val connectedProjectGraphs: Set[ProjectGraph] = Set()
  }

  implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), sourceGear)

  val fromTokenTestComponent = OMLensAssignmentComponent(
    Some(OMStringFinder(Entire, "variable")),
    "value",
    None,
    SetValue
  )

  val fromAbstractionTestComponent = OMLensAssignmentComponent(
    None,
    "value",
    SchemaRef.fromString("abdefg:hello@0.1.0/my-abstraction").toOption,
    SetValue
  )



  describe("validation") {
    it("identifies valid fromToken options ") {
      assert(fromTokenTestComponent.fromToken)
      assert(fromTokenTestComponent.isValid)
    }
    it("identifies valid fromAny options ") {
      assert(fromAbstractionTestComponent.fromAbstraction)
      assert(fromAbstractionTestComponent.isValid)
    }

    it("catches invalid forms of the component") {
      assertThrows[Exception] {
        OMLensAssignmentComponent(
          None,
          "value",
          None,
          SetValue
        )
      }
    }

  }

  def parseGearFixture = parseGearFromSnippetWithComponents(
    "doThing('string-value', variable)",
    Map(
      "value" -> fromTokenTestComponent,
      "string" -> OMLensCodeComponent(Literal, OMStringFinder(Containing, "string-value"))
    ),
    schemaId = "call-it"
  )


  def parseAssignGearFixture = {
    parseGearFromSnippetWithComponents(
      "assign('string-value')",
      Map(
        "value" -> OMLensCodeComponent(Literal, OMStringFinder(Containing, "string-value"))
      ),
      id = "assign",
      schemaId = "assign"
    )
  }

  def test(block: String, parseGear: ParseAsModel) = {
    val a = sample(block)
    (parseGear.matches(a.entryChildren.head, true)(a.astGraph, block, sourceGearContext, project), a.astGraph, block)
  }

  it("creates the correct node description and parser for a fromToken component") {
    val parseGear = parseGearFixture
    assert(parseGear._1.listeners.size == 1)
    assert(parseGear._1.rules.size == 2)
  }

  it("can parse simple value of component") {
    val parseGear = parseGearFixture._1
    val result = test("doThing('at-url', handler)", parseGear)._1
    assert(result.isDefined)
    assert(result.get.modelNode.value == JsObject(Seq("string" -> JsString("at-url"))))
  }

  describe("collecting token values") {

    def fixture = new {
      val parseGear = parseGearFixture
      val lens = CompiledLens(None, "call-it", parseGear._2.packageRef, parseGear._2.schema, Set(AstType("CallExpression", "es7")), parseGear._1, null, 0, false)

      val assignLens = {
        val assignGear = parseAssignGearFixture
        CompiledLens(None, "assign", assignGear._2.packageRef, assignGear._2.schema, Set(AstType("CallExpression", "es7")), assignGear._1, null, 0, false)
      }

      implicit val sourceGear = new SourceGear {
        override val parsers: Set[ParserBase] = SourceParserManager.installedParsers
        override val lensSet = new LensSet(lens, assignLens)
        override val schemas = Set()
        override val transformations = Set()
        override val flatContext: FlatContext = FlatContext(None, Map.empty)
        override val connectedProjectGraphs: Set[ProjectGraph] = Set()
      }

      def test(block: String) = {
        val parseResults = sourceGear.parseString(block)(project, "es7")


        implicit val sourceGearContext = SGContext(sourceGear.fileAccumulator, parseResults.get.astGraph, SourceParserManager.installedParsers.head, null, sourceGear, null, parseResults.get.fileTokenRegistry)
        val mn = parseResults.get.modelNodes
        val callModel = mn.find(_.schemaId.id == "call-it").get
        callModel.expandedValue()(sourceGearContext)
      }

    }

    it("can parse the expanded value of the component") {

      val f = fixture
      val expandedValue = f.test(
        """
          |const handler2 = assign('abcdefg')
          |doThing('at-url', handler2)
        """.stripMargin)

      assert(expandedValue == Json.parse("""{"string":"at-url","value":"abcdefg"}"""))
    }

    it("will not include if it's out of scope") {

      val f = fixture
      val expandedValue = f.test(
        """
          |function test() {
          |   const handler2 = assign('abcdefg')
          |}
          |
          |doThing('at-url', handler2)
        """.stripMargin)

      assert(expandedValue == Json.parse("""{"string":"at-url"}"""))
    }

  }


}

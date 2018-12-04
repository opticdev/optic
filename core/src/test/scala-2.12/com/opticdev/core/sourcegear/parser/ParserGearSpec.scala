package com.opticdev.core.sourcegear.parser

import better.files.File
import com.opticdev.common.{ObjectRef, PackageRef}
import com.opticdev.core.Fixture.AkkaTestFixture
import com.opticdev.core.Fixture.compilerUtils.ParserUtils
import com.opticdev.core.sourcegear.accumulate.FileAccumulator
import com.opticdev.core.sourcegear.annotations.SourceAnnotation
import com.opticdev.core.sourcegear.context.FlatContext
import com.opticdev.core.sourcegear.graph.ProjectGraph
import com.opticdev.sdk.descriptions.enums.FinderEnums.{Containing, Entire, Starting}
import com.opticdev.core.sourcegear.{LensSet, SourceGear}
import com.opticdev.core.sourcegear.project.{Project, StaticSGProject}
import com.opticdev.sdk.rules.Any
import com.opticdev.parsers.{ParserBase, SourceParserManager}
import com.opticdev.sdk.descriptions.transformation.TransformationRef
import com.opticdev.sdk.skills_sdk.lens._
import play.api.libs.json._

class ParserGearSpec extends AkkaTestFixture("ParserGearTest") with ParserUtils {

  implicit val sourceGear = new SourceGear {
    override val parsers: Set[ParserBase] = SourceParserManager.installedParsers
    override val lensSet = new LensSet()
    override val schemas = Set()
    override val transformations = Set()
    override val flatContext: FlatContext = FlatContext(None, Map.empty)
    override val connectedProjectGraphs: Set[ProjectGraph] = Set()
  }

  implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), sourceGear)


  describe("Matching and extracting") {
    it("Can build a valid description from snippet") {
      val block = "var hello = require('world')"

      val (parseGear, lens) = parseGearFromSnippetWithComponents("var hello = require('world')", Map())

      assert(parseGear.description.toString == """NodeDescription(AstType(VariableDeclaration,es7),Range 0 until 28,Child(0,null,false),Map(kind -> StringProperty(var)),Vector(NodeDescription(AstType(VariableDeclarator,es7),Range 4 until 28,Child(0,declarations,true),Map(),Vector(NodeDescription(AstType(Identifier,es7),Range 4 until 9,Child(0,id,false),Map(name -> StringProperty(hello)),Vector(),Vector()), NodeDescription(AstType(CallExpression,es7),Range 12 until 28,Child(0,init,false),Map(),Vector(NodeDescription(AstType(Literal,es7),Range 20 until 27,Child(0,arguments,true),Map(value -> StringProperty(world)),Vector(),Vector()), NodeDescription(AstType(Identifier,es7),Range 12 until 19,Child(0,callee,false),Map(name -> StringProperty(require)),Vector(),Vector())),Vector())),Vector())),Vector())""")
    }

    it("Can match its original snippet to the description") {
      val (parseGear, lens) = parseGearFromSnippetWithComponents("var hello = require('world')", Map())

      val block = "var hello = require('world')"

      val parsedSample = sample(block)
      val result = parseGear.matches(parsedSample.entryChildren.head)(parsedSample.astGraph, block, sourceGearContext, project)
      assert(result.isDefined)
    }

    it("fails to match a different snippet than the description") {
      val (parseGear, lens) = parseGearFromSnippetWithComponents("var hello = require('world')", Map())

      val block = "var goodbye = notRequire('nation')"

      val parsedSample = sample(block)
      val result = parseGear.matches(parsedSample.entryChildren.head)(parsedSample.astGraph, block, sourceGearContext, project)
      assert(!result.isDefined)

    }

    describe("with rules") {

      it("Matches any value for a token component/extracts value") {
        val (parseGear, lens) = parseGearFromSnippetWithComponents("var hello = require('world')", Map(
          //this causes any token rule to be applied
          "definedAs" -> OMLensCodeComponent(Token, OMStringFinder(Entire, "hello"))
        ))

        val block = "var otherValue = require('world')"

        val parsedSample = sample(block)
        val result = parseGear.matches(parsedSample.entryChildren.head, true)(parsedSample.astGraph, block, sourceGearContext, project)
        assert(result.isDefined)

        assert(result.get.modelNode.value == JsObject(Seq("definedAs" -> JsString("otherValue"))))
      }

      describe("matches based on parser defined rules") {

        describe("specific children") {

          it("matches when specific children rules are enforced") {
            val (parseGear, lens) = parseGearFromSnippetWithComponents(
              """var hello = (<div attrOne="OneValue" attrTwo="Two"><span/><hr/></div>)""", Map(
                //this causes any token rule to be applied
                "definedAs" -> OMLensCodeComponent(Token, OMStringFinder(Entire, "hello")),
                "attrOneValue" -> OMLensCodeComponent(Literal, OMStringFinder(Containing, "OneValue"))
              ))

            val block = """var hello = (<div attrTwo="Two" attrOne="changedIt" plusOther="Three"><span/><hr/></div>)"""

            val parsedSample = sample(block)
            val result = parseGear.matches(parsedSample.entryChildren.head, true)(parsedSample.astGraph, block, sourceGearContext, project)
            assert(result.isDefined)
            assert(result.get.modelNode.value == JsObject(Seq("definedAs" -> JsString("hello"), "attrOneValue" -> JsString("changedIt"))))
          }

          it("matches when specific children rules are enforced and a global rule for other children is set") {
            val (parseGear, lens) = parseGearFromSnippetWithComponents(
              s"""var hello = (
                 |<div attrOne="OneValue" attrTwo="Two">
                 |  //:children
                 |  <span/>
                 |  <hr/>
                 |</div>)""".stripMargin, Map(
                //this causes any token rule to be applied
                "definedAs" -> OMLensCodeComponent(Token, OMStringFinder(Entire, "hello")),
                "attrOneValue" -> OMLensCodeComponent(Literal, OMStringFinder(Containing, "OneValue"))
              ), subContainers = Map("children" -> Any))

            val block =  s"""var hello = (
                            |<div attrOne="OneValue" attrTwo="Two">
                            |  <RANDOM />
                            |</div>)""".stripMargin

            val parsedSample = sample(block)
            val result = parseGear.matches(parsedSample.entryChildren.head, true)(parsedSample.astGraph, block, sourceGearContext, project)
            assert(result.isDefined)
          }

          it("does not match when specific children rules match but other do not") {
            val (parseGear, lens) = parseGearFromSnippetWithComponents(
              """var hello = (<div attrOne="OneValue" attrTwo="Two"><span/><hr/></div>)""", Map(
                //this causes any token rule to be applied
                "definedAs" -> OMLensCodeComponent(Token, OMStringFinder(Entire, "hello")),
                "attrOneValue" -> OMLensCodeComponent(Literal, OMStringFinder(Containing, "OneValue"))
              ))

            val block = """var hello = (<div attrTwo="Two" attrOne="changedIt" plusOther="Three"></div>)"""

            val parsedSample = sample(block)
            val result = parseGear.matches(parsedSample.entryChildren.head, true)(parsedSample.astGraph, block, sourceGearContext, project)
            assert(result.isEmpty)
          }

        }
      }

    }

    describe("with extractors") {

      it("literals") {
        val (parseGear, lens) = parseGearFromSnippetWithComponents("var hello = require('world')", Map(
          "pathTo" -> OMLensCodeComponent(Literal, OMStringFinder(Containing, "world"))
        ))

        val block = "var hello = require('that-lib')"

        val parsedSample = sample(block)
        val result = parseGear.matches(parsedSample.entryChildren.head, true)(parsedSample.astGraph, block, sourceGearContext, project)
        assert(result.isDefined)

        val expected = JsObject(Seq("pathTo" -> JsString("that-lib")))
        assert(result.get.modelNode.value == expected)
      }

      it("tokens") {
        val (parseGear, lens) = parseGearFromSnippetWithComponents("var hello = require('world')", Map(
          "definedAs" -> OMLensCodeComponent(Token, OMStringFinder(Entire, "hello"))
        ))

        val block = "var otherValue = require('world')"

        val parsedSample = sample(block)
        val result = parseGear.matches(parsedSample.entryChildren.head, true)(parsedSample.astGraph, block, sourceGearContext, project)
        assert(result.isDefined)

        val expected = JsObject(Seq("definedAs" -> JsString("otherValue")))
        assert(result.get.modelNode.value == expected)
      }

      it("object literals") {
        val (parseGear, lens) = parseGearFromSnippetWithComponents("var hello = { object: 'value' }", Map(
          "value" -> OMLensCodeComponent(ObjectLiteral, OMStringFinder(Starting, "{ object:"))
        ))

        val block = "var hello = { one: 1, two: 2, three: { asNumber: 3 } }"

        val parsedSample = sample(block)
        val result = parseGear.matches(parsedSample.entryChildren.head, true)(parsedSample.astGraph, block, sourceGearContext, project)
        assert(result.isDefined)

        val value = JsObject(Seq("one" -> JsNumber(1), "two" -> JsNumber(2), "three" -> JsObject(
          Seq("asNumber" -> JsNumber(3), "_order" -> JsArray(Seq(JsString("asNumber"))))
        ), "_order" -> JsArray(Seq(JsString("one"), JsString("two"), JsString("three"))))
        )

        val expected = JsObject(Seq("value" -> value))
        assert(result.get.modelNode.value == expected)
      }

      it("array literals") {
        val (parseGear, lens) = parseGearFromSnippetWithComponents("var hello = [1,2,3]", Map(
          "value" -> OMLensCodeComponent(ArrayLiteral, OMStringFinder(Starting, "["))
        ))

        val block = "var hello = [1,2,3,4,5]"

        val parsedSample = sample(block)
        val result = parseGear.matches(parsedSample.entryChildren.head, true)(parsedSample.astGraph, block, sourceGearContext, project)
        assert(result.isDefined)

        val value = JsArray(Seq(
          JsNumber(1),
          JsNumber(2),
          JsNumber(3),
          JsNumber(4),
          JsNumber(5)
        ))

        val expected = JsObject(Seq("value" -> value))
        assert(result.get.modelNode.value == expected)
      }

    }

  }

  describe("Hidden values") {

    lazy val (parseGear, lens) = parseGearFromSnippetWithComponents("abe.thing.token('experiment')", Map(
      "argone" -> OMLensCodeComponent(Literal, OMStringFinder(Containing, "experiment")),
      "computed" -> OMLensComputedFieldComponent(Vector(
        OMLensCodeComponent(Token, OMStringFinder(Entire, "abe")),
        OMLensCodeComponent(Token, OMStringFinder(Entire, "thing")),
        OMLensCodeComponent(Token, OMStringFinder(Entire, "token"))
      ), ConcatStrings, false)
    ))

    val block = "a.b.cdefg('value')"

    it("can pickup hidden values") {

      val parsedSample = sample(block)
      val result = parseGear.matches(parsedSample.entryChildren.head, true)(parsedSample.astGraph, block, sourceGearContext, project)
      assert(result.isDefined)
      assert(result.get.modelNode.hiddenValue.value.head._2 == Json.parse("""{"0":"a","1":"b","2":"cdefg"}"""))
    }

    it("can will compute fields properly") {

      val sgContext = sourceGearContext.copy(fileAccumulator = FileAccumulator(parseGear.listeners.toSet.groupBy(_.lensRef)))

      val parsedSample = sample(block)
      val result = parseGear.matches(parsedSample.entryChildren.head, true)(parsedSample.astGraph, block, sgContext, project)
      assert(result.get.modelNode.expandedValue(false)(sgContext) == Json.parse("""{"argone":"value","computed":"abcdefg"}"""))
    }

  }




}

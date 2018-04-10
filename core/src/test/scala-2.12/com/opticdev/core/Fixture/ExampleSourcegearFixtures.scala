package com.opticdev.core.Fixture

import com.opticdev.common.PackageRef
import com.opticdev.core.Fixture.compilerUtils.{GearUtils, ParserUtils}
import com.opticdev.core.compiler.stages.RenderFactoryStage
import com.opticdev.core.sourcegear.context.FlatContext
import com.opticdev.core.sourcegear.{CompiledLens, LensSet, SourceGear}
import com.opticdev.parsers.{ParserBase, SourceParserManager}
import com.opticdev.sdk.descriptions._
import com.opticdev.sdk.descriptions.enums.FinderEnums.{Containing, Entire, Starting}
import com.opticdev.sdk.descriptions.enums.RuleEnums.SameAnyOrderPlus
import com.opticdev.sdk.descriptions.enums.{RuleEnums, VariableEnums}
import com.opticdev.sdk.descriptions.finders.StringFinder
import play.api.libs.json.JsObject

object ExampleSourcegearFixtures extends TestBase with GearUtils with ParserUtils {

  def routeQueryResponse = new {
    val responseGear = {
      val block = "response.send(thing)"
      implicit val (parseGear, lens) = parseGearFromSnippetWithComponents(block, Vector(
        CodeComponent(Seq("operation"), StringFinder(Entire, "thing"))
      ),
        variables = Vector(Variable("response", VariableEnums.Scope))
      )

      val renderer = new RenderFactoryStage(sample(block), parseGear).run.renderGear

      CompiledLens(Some("do"), "do", PackageRef.fromString("optic:test").get, SchemaRef(Some(PackageRef("optic:test", "0.1.0")), "response"), Set(), parseGear, renderer)
    }

    val queryGear = {
      val block =
        """
          |query({}, function (err, item) {
          |  if (!err) {
          |   //:success
          |  } else {
          |   //:failure
          |  }
          |})""".stripMargin
      implicit val (parseGear, lens) = parseGearFromSnippetWithComponents(block,
        Vector(
          CodeComponent(Seq("fields"), StringFinder(Entire, "{}"))
        ),
        variables = Vector(Variable("err", VariableEnums.Self), Variable("item", VariableEnums.Self)),
        subContainers = Vector(
          SubContainer("success", Vector(), RuleEnums.Any, Vector()),
          SubContainer("failure", Vector(), RuleEnums.Any, Vector())
        )
      )

      val renderer = new RenderFactoryStage(sample(block), parseGear).run.renderGear

      CompiledLens(Some("query"), "queryLens", PackageRef.fromString("optic:test").get, SchemaRef(Some(PackageRef("optic:test", "0.1.0")), "query"), Set(), parseGear, renderer)
    }

    val block =
      """call("value", function (request, response) {
        | //:callback
        |})""".stripMargin

    implicit val (parseGear, lens) = parseGearFromSnippetWithComponents(block, Vector(
      CodeComponent(Seq("arg1"), StringFinder(Containing, "value"))
    ),
      variables = Vector(Variable("request", VariableEnums.Self), Variable("response", VariableEnums.Self)),
      subContainers = Vector(
      SubContainer("callback", Vector(), SameAnyOrderPlus, Vector(
        SchemaComponent(Seq("properties"), responseGear.schemaRef, true, None)
      ))
    ))

    val renderer = new RenderFactoryStage(sample(block), parseGear).run.renderGear

    val routeGear = CompiledLens(Some("wrapper"), "wrapper", PackageRef.fromString("optic:test").get, SchemaRef(Some(PackageRef("optic:test", "0.1.0")), "route"), Set(), parseGear, renderer)

    val schemaSet = Seq(
      Schema(SchemaRef(Some(PackageRef("optic:test", "0.1.0")), "query"), JsObject.empty),
      Schema(SchemaRef(Some(PackageRef("optic:test", "0.1.0")), "response"), JsObject.empty),
      Schema(SchemaRef(Some(PackageRef("optic:test", "0.1.0")), "route"), JsObject.empty)
    )

    val sourceGear : SourceGear = new SourceGear {
      override val parsers: Set[ParserBase] = SourceParserManager.installedParsers
      override val lensSet = new LensSet(routeGear, queryGear, responseGear)
      override val schemas = schemaSet.toSet
      override val transformations = Set()
      override val flatContext: FlatContext = FlatContext(None, Map(
        "optic:test" -> FlatContext(Some(PackageRef("optic:test", "0.1.0")), Map(
          "queryLens" -> queryGear,
          "do" -> responseGear,
          "query" -> schemaSet(0),
          "response" -> schemaSet(1),
          "route" -> schemaSet(2)
        ))
      ))
    }
  }

}

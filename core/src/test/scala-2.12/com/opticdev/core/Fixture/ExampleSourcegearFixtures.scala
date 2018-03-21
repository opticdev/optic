package com.opticdev.core.Fixture

import com.opticdev.common.PackageRef
import com.opticdev.core.Fixture.compilerUtils.{GearUtils, ParserUtils}
import com.opticdev.core.compiler.stages.RenderFactoryStage
import com.opticdev.core.sourcegear.{Gear, GearSet, SourceGear}
import com.opticdev.parsers.{ParserBase, SourceParserManager}
import com.opticdev.sdk.descriptions._
import com.opticdev.sdk.descriptions.enums.FinderEnums.{Containing, Entire}
import com.opticdev.sdk.descriptions.enums.RuleEnums.SameAnyOrderPlus
import com.opticdev.sdk.descriptions.enums.{RuleEnums, VariableEnums}
import com.opticdev.sdk.descriptions.finders.StringFinder

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

      Gear("do", "optic:test", SchemaRef(PackageRef("optic:test"), "response"), Set(), parseGear, renderer)
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
      implicit val (parseGear, lens) = parseGearFromSnippetWithComponents(block, Vector(),
        variables = Vector(Variable("err", VariableEnums.Self), Variable("item", VariableEnums.Self)),
        subContainers = Vector(
          SubContainer("success", Vector(), RuleEnums.Any, Vector()),
          SubContainer("failure", Vector(), RuleEnums.Any, Vector()),
        )
      )

      val renderer = new RenderFactoryStage(sample(block), parseGear).run.renderGear

      Gear("query", "optic:test", SchemaRef(PackageRef("optic:test"), "query"), Set(), parseGear, renderer)
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

    val routeGear = Gear("wrapper", "optic:test", SchemaRef(PackageRef("optic:test"), "route"), Set(), parseGear, renderer)

    val sourceGear : SourceGear = new SourceGear {
      override val parsers: Set[ParserBase] = SourceParserManager.installedParsers
      override val gearSet = new GearSet(routeGear, queryGear, responseGear)
      override val schemas = Set()
      override val transformations = Set()
    }
  }

}

package com.opticdev.core.Fixture

import com.opticdev.common.{PackageRef, SchemaRef}
import com.opticdev.core.Fixture.compilerUtils.{GearUtils, ParserUtils}
import com.opticdev.core.compiler.stages.RenderFactoryStage
import com.opticdev.core.sourcegear.context.FlatContext
import com.opticdev.core.sourcegear.graph.ProjectGraph
import com.opticdev.core.sourcegear.{CompiledLens, LensSet, SourceGear}
import com.opticdev.parsers.graph.AstType
import com.opticdev.parsers.{ParserBase, SourceParserManager}
import com.opticdev.sdk.descriptions._
import com.opticdev.sdk.descriptions.enums.FinderEnums.{Containing, Entire, Starting}
import com.opticdev.parsers.rules._
import com.opticdev.sdk.skills_sdk.lens._
import com.opticdev.sdk.skills_sdk.schema.OMSchema
import play.api.libs.json.JsObject

object ExampleSourcegearFixtures extends TestBase with GearUtils with ParserUtils {

  def routeQueryResponse = new {
    val responseGear = {
      val block = "response.send(thing)"
      implicit val (parseGear, lens) = parseGearFromSnippetWithComponents(block, Map(
        "operation" -> OMLensCodeComponent(Token, OMStringFinder(Entire, "thing"))
      ),
        variables = Map("response" -> Scope)
      )

      val renderer = new RenderFactoryStage(sample(block), parseGear).run.renderGear

      CompiledLens(Some("do"), "do", PackageRef.fromString("optic:test").get, Left(SchemaRef(Some(PackageRef("optic:test", "0.1.0")), "response")), Set(AstType("MemberExpression", "es7")), parseGear, renderer, 1)
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
        Map(
          "fields" -> OMLensCodeComponent(ObjectLiteral, OMStringFinder(Entire, "{}"))
        ),
        variables = Map(
          "err" -> Self,
          "item" -> Self
        ),
        subContainers = Map(
          "success" -> Any,
          "failure" -> Any
        )
      )

      val renderer = new RenderFactoryStage(sample(block), parseGear).run.renderGear

      CompiledLens(Some("query"), "queryLens", PackageRef.fromString("optic:test").get, Left(SchemaRef(Some(PackageRef("optic:test", "0.1.0")), "query")), Set(AstType("CallExpression", "es7")), parseGear, renderer, 1)
    }

    val block =
      """call("value", function (request, response) {
        | //:callback
        |})""".stripMargin

    implicit val (parseGear, lens) = parseGearFromSnippetWithComponents(block,
      Map(
        "arg1" -> OMLensCodeComponent(Literal, OMStringFinder(Containing, "value")),
        "properties" -> OMLensSchemaComponent(responseGear.schemaRef, unique = true)
      ),
      Map(
        "callback" -> SameAnyOrderPlus
      ),
      Map(
        "request" -> Self,
        "response" -> Self
      )
    )

    val renderer = new RenderFactoryStage(sample(block), parseGear).run.renderGear

    val routeGear = CompiledLens(Some("wrapper"), "wrapper", PackageRef.fromString("optic:test").get, Left(SchemaRef(Some(PackageRef("optic:test", "0.1.0")), "route")), Set(AstType("CallExpression", "es7")), parseGear, renderer, 1)

    val schemaSet = Seq(
      OMSchema(SchemaRef(Some(PackageRef("optic:test", "0.1.0")), "query"), JsObject.empty),
      OMSchema(SchemaRef(Some(PackageRef("optic:test", "0.1.0")), "response"), JsObject.empty),
      OMSchema(SchemaRef(Some(PackageRef("optic:test", "0.1.0")), "route"), JsObject.empty)
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
      override val connectedProjectGraphs: Set[ProjectGraph] = Set()
    }
  }

}

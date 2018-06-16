package com.opticdev.core.compiler.stages

import com.opticdev.common.PackageRef
import com.opticdev.core.BlankSchema
import com.opticdev.core.Fixture.compilerUtils.GearUtils
import com.opticdev.core.sourcegear.{LensSet, SourceGear}
import com.opticdev.core.sourcegear.containers.SubContainerManager
import com.opticdev.core.sourcegear.context.FlatContext
import com.opticdev.core.sourcegear.variables.VariableManager
import com.opticdev.parsers.{ParserBase, SourceParserManager}
import com.opticdev.parsers.rules.Any
import com.opticdev.sdk.descriptions._
import com.opticdev.sdk.descriptions.enums.FinderEnums.Containing
import com.opticdev.sdk.descriptions.enums.VariableEnums
import com.opticdev.sdk.descriptions.finders.StringFinder
import com.opticdev.sdk.descriptions.transformation.Transformation
import play.api.libs.json.JsObject

object MultiNodeFixture extends GearUtils {

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

  def endToEndFixture = new {

    lazy val syncTestSourceGear = sourceGearFromDescription("test-examples/resources/example_packages/synctest.json")

    lazy val f = fixture
    implicit lazy val lens = f.lens
    lazy val multiNodeLens = new MultiNodeParserFactoryStage(f.snippetOutput).run.multiNodeLens

    lazy implicit val sourcegear = new SourceGear {
      override val parsers: Set[ParserBase] = SourceParserManager.installedParsers
      override val transformations: Set[Transformation] = syncTestSourceGear.transformations
      override val flatContext: FlatContext = FlatContext(None, Map(
        "none:none" -> FlatContext(None, Map(
          "example____0" -> multiNodeLens.childLenses.head,
          "example____1" -> multiNodeLens.childLenses.last,
          "example" -> multiNodeLens
        ))
      ))
      override val schemas: Set[Schema] = Set(Schema(multiNodeLens.schemaRef, JsObject.empty)) ++ multiNodeLens.childLenses.map(i => Schema(i.schemaRef, JsObject.empty)).toSet
      override val lensSet: LensSet = new LensSet(multiNodeLens)
    }
  }

}

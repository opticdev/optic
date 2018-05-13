package com.opticdev.core.Fixture

import com.opticdev.common.PackageRef
import com.opticdev.core.sourcegear.gears.RuleProvider
import com.opticdev.core.sourcegear.gears.parsing.{AdditionalParserInformation, NodeDescription, ParseAsModel}
import com.opticdev.core.sourcegear.gears.rendering.RenderGear
import com.opticdev.core.sourcegear.variables.VariableManager
import com.opticdev.parsers.{IdentifierNodeDesc, ParserRef}
import com.opticdev.parsers.graph.AstType
import com.opticdev.sdk.descriptions.{LensRef, SchemaRef}
import play.api.libs.json.JsObject


object DummyCompilerOutputs {

  private implicit val ruleProvider = new RuleProvider()

  val parser = ParseAsModel(
    NodeDescription(AstType("test", "test"),
      Range(1,10),
      properties = Map(),
      children = Vector() ,
      rules = Vector()
    ),
    SchemaRef.fromString("test:test/place").get,
    Map(),
    Map(),
    Map(),
    Vector(),
    VariableManager.empty,
    AdditionalParserInformation(IdentifierNodeDesc(AstType("A", "B"), Seq()), Seq()),
    "test:test",
    LensRef(Some(PackageRef("test:test")), "place-lens"),
    JsObject.empty
  )

  val render = RenderGear(
    "",
    ParserRef.fromString("test:parser").get,
    parser,
    NodeDescription(AstType("test", "test"),
      Range(1,10),
      properties = Map(),
      children = Vector() ,
      rules = Vector()
    ),
    "test:test"
  )

}

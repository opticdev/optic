package com.opticdev.core.sourcegear.gears

import com.opticdev.core.Fixture.TestBase
import com.opticdev.parsers.graph.AstType
import com.opticdev.parsers.rules._
import com.opticdev.parsers.{ParserBase, SourceParserManager}
import com.opticdev.sdk.descriptions.ChildrenRule
import org.scalatest.FunSpec

class RuleProviderSpec extends TestBase {

  implicit val parser: ParserBase = SourceParserManager.installedParsers.head

  it("will return the default children rule if none specified") {
    val default = RuleProvider.applyDefaultRulesForType(Vector(), AstType("Any", "es7"))
    assert(default.size == 1)
    assert(default.head.asInstanceOf[ParserChildrenRule].rule == Exact)
  }

  it("will include rules from the parser") {
    val default = RuleProvider.applyDefaultRulesForType(Vector(), AstType("JSXOpeningElement", "es7"))
    assert(default.size == 2)
    assert(default.head.asInstanceOf[SpecificChildrenRule].rule == SameAnyOrderPlus)
    assert(default.last.asInstanceOf[AllChildrenRule].rule == Exact)
  }

  it("if lens provides rule only that rule is returned") {
    val default = RuleProvider.applyDefaultRulesForType(Vector(ChildrenRule(null, Any)), AstType("JSXOpeningElement", "es7"))
    assert(default.size == 2)
    assert(default.head.asInstanceOf[AllChildrenRule].rule == Any)
    assert(default.last.asInstanceOf[SpecificChildrenRule].rule == SameAnyOrderPlus)
  }

}

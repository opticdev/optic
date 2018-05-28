package com.opticdev.arrow.changes.evaluation

import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.Fixture.compilerUtils.GearUtils
import com.opticdev.marvin.common.ast.NewAstNode
import com.opticdev.parsers.graph.AstType

class InsertCodeSpec extends TestBase with GearUtils {

  def generatedNode(typeName: String)

  NewAstNode("VariableDeclation", Range(0,0), Map.empty, Some())

  it("can insert code in an empty file") {
    val generatedNode())


  }

  it("can insert code in a child of a top level block") {

  }

  it("can insert code between two other sections of code") {

  }

  it("can insert code at the top of a sequence of code sections") {

  }

  it("preserves comments when inserting code") {

  }


}

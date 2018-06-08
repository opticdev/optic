package com.opticdev.sdk.transformation

import com.opticdev.sdk.VariableMapping
import com.opticdev.sdk.descriptions.transformation.generate.{RenderOptions, StagedNode}
import org.scalatest.FunSpec

class StagedNodeSpec extends FunSpec {

  def stagedNodeWithTagVariablesAndChildren(tagOption: Option[String], variablesMap: VariableMapping, children: Seq[StagedNode]) = {
    StagedNode(null, null, Some(RenderOptions(
      containers = Some( Map("a" -> children) ),
      tag = tagOption,
      variables = Some(variablesMap)
    )))
  }

  describe("Variables for tags") {

    it("empty if tag does not exist") {
      val node = stagedNodeWithTagVariablesAndChildren(Some("self"), Map("Test" -> "GO"), Seq())
      assert(node.variablesForTag("NOT REAL") == Map.empty)
    }

    it("will find any variables in self") {
      val node = stagedNodeWithTagVariablesAndChildren(Some("self"), Map("Test" -> "GO"), Seq())
      assert(node.variablesForTag("self") == Map("Test" -> "GO"))
    }

    it("will override parent with child variable") {
      val node = stagedNodeWithTagVariablesAndChildren(Some("self"), Map("Test" -> "GO"), Seq())
      stagedNodeWithTagVariablesAndChildren(None, Map("TEST" -> "SHOULD_NOT_SEE"), Seq(node))
      assert(node.variablesForTag("self") == Map("Test" -> "GO"))
    }

    it("will override parent with child variable but leave those that do not collide") {
      val node = stagedNodeWithTagVariablesAndChildren(Some("self"), Map("Test" -> "GO", "safe" -> "should_remain"), Seq())
      stagedNodeWithTagVariablesAndChildren(None, Map("TEST" -> "SHOULD_NOT_SEE"), Seq(node))
      assert(node.variablesForTag("self") == Map("Test" -> "GO", "safe" -> "should_remain"))
    }

    it("variables for children of tag are not included") {
      val lowest = stagedNodeWithTagVariablesAndChildren(None, Map("Test" -> "OVERRIDE"), Seq())
      val node = stagedNodeWithTagVariablesAndChildren(Some("self"), Map("Test" -> "GO"), Seq(lowest))
      stagedNodeWithTagVariablesAndChildren(None, Map("TEST" -> "SHOULD_NOT_SEE"), Seq(node))
      assert(node.variablesForTag("self") == Map("Test" -> "GO"))
    }

  }

}

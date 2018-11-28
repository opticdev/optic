package com.opticdev.core.sourcegear.annotations.dsl

import org.scalatest.FunSpec
import play.api.libs.json.JsString

class AnnotationsDslAstNodeSpec extends FunSpec {

  it("Nodes get proper IDs") {
    val node = AssignmentNode(Seq("key", "key1"), Some(JsString("Hello")))
    assert(node.nodeType == "AssignmentNode")
  }

  

}

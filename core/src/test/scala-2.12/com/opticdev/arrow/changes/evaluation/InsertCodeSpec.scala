package com.opticdev.arrow.changes.evaluation

import better.files.File
import com.opticdev.arrow.changes.location.AsChildOf
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.Fixture.compilerUtils.GearUtils
import com.opticdev.core.sourcegear.project.monitoring.FileStateMonitor
import com.opticdev.marvin.common.ast.NewAstNode
import com.opticdev.parsers.graph.AstType

class InsertCodeSpec extends TestBase with GearUtils {

  val empty = File("test-examples/resources/example_source/InsertAtLocation/empty.js")
  val toplevel = File("test-examples/resources/example_source/InsertAtLocation/toplevel.js")
  val between = File("test-examples/resources/example_source/InsertAtLocation/between.js")

  implicit val filesStateMonitor = new FileStateMonitor


  def generatedNode(typeName: String, raw: String) =
    (NewAstNode(typeName, Map.empty, Some(raw)), raw)


  it("can insert a single line of code in an empty file") {
    val node = generatedNode("VariableDeclaration", "var me = 1+2")

    val aco = AsChildOf(empty, 0)
    val result = aco.resolveToLocation(sourceGear).get
    val insertion = InsertCode.atLocation(node, empty, result)


    assert(insertion.isSuccess)
    assert(insertion.asFileChanged.newContents == "var me = 1+2")

  }

  it("can insert a multiple lines of code in an empty file") {

    val source =
      """var me = function () {
        |   doThing().now()
        |}
      """.stripMargin

    val node = generatedNode("VariableDeclaration", source)

    val aco = AsChildOf(empty, 0)
    val result = aco.resolveToLocation(sourceGear).get
    val insertion = InsertCode.atLocation(node, empty, result)


    assert(insertion.isSuccess)
    assert(insertion.asFileChanged.newContents == source)

  }

  it("can insert code in a child of a top level block") {
    val source =
      """var me = function () {
        |   doThing().now()
        |}
      """.stripMargin

    val file = "function Test() {\n  var me = function () {\n     doThing().now()\n  }\n        \n}"

    val node = generatedNode("VariableDeclaration", source)

    val aco = AsChildOf(toplevel, 30)
    val result = aco.resolveToLocation(sourceGear).get
    val insertion = InsertCode.atLocation(node, toplevel, result)

    assert(insertion.isSuccess)
    assert(insertion.asFileChanged.newContents == file)

  }

  it("can insert code between two other sections of code") {

    val source = "app.get('second', otherHandler)"
    val node = generatedNode("CallExpression", source)

    val file = "const app = express()\n\napp.get('first', handler) //name: Create Route\n\n\napp.get('second', otherHandler)\n\napp.post('third', function (req, res) {\n\n    doThing()\n})"

    val aco = AsChildOf(between, 49)
    val result = aco.resolveToLocation(sourceGear).get
    val insertion = InsertCode.atLocation(node, between, result)

    println(insertion.asFileChanged.newContents)

    assert(insertion.asFileChanged.newContents == file)

  }

  it("can insert code at the top of a sequence of code sections") {

    val source = "app.get('second', otherHandler)"
    val node = generatedNode("CallExpression", source)

    val file = "const app = express()\n\napp.get('first', handler) //name: Create Route\n\n\napp.post('third', function (req, res) {\n\n      app.get('second', otherHandler)\ndoThing()\n})"

    val aco = AsChildOf(between, 116)
    val result = aco.resolveToLocation(sourceGear).get
    val insertion = InsertCode.atLocation(node, between, result)

    assert(insertion.asFileChanged.newContents == file)

  }

}

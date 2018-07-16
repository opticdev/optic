package com.opticdev.core.sourcegear

import better.files.File
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.sourcegear.project.config.ProjectFile
import com.opticdev.opm.{PackageManager, TestPackageProviders, TestProvider}
import com.opticdev.parsers.SourceParserManager
import org.scalatest.FunSpec

import scala.concurrent.duration._
import scala.concurrent.Await

class SGConstructorSpec extends TestBase with TestPackageProviders {

  lazy val projectFile = new ProjectFile(File("test-examples/resources/example_packages/express/optic.yml"))

  it("can resolve all dependencies in a project file") {
    assert(SGConstructor.dependenciesForProjectFile(projectFile).get.toString == """Tree(Vector(Leaf(OpticMDPackage({"info":{"author":"optic","package":"express-js","version":"0.1.0","dependencies":{"optic:rest":"0.1.0"}},"schemas":[],"lenses":[{"name":"Route","id":"route","schema":"optic:rest/route","snippet":{"language":"es7","block":"app.get('url', function (req, res) {\n  //:callback\n})"},"value":{"method":{"type":"token","at":{"astType":"Identifier","range":{"start":4,"end":7}}},"url":{"type":"literal","at":{"astType":"Literal","range":{"start":8,"end":13}}},"parameters":{"schemaRef":"optic:rest/parameter","unique":true,"inContainer":"callback"}},"variables":{"req":"self","res":"self"},"containers":{"callback":"any"},"range":{"start":2019,"end":2287}},{"name":"Parameter","id":"parameter","schema":"optic:rest/parameter","snippet":{"language":"es7","block":"req.query.name"},"scope":"public","value":{"name":{"type":"token","at":{"astType":"Identifier","range":{"start":10,"end":14}}},"in":{"type":"token","at":{"astType":"Identifier","range":{"start":4,"end":9}}}},"range":{"start":2336,"end":2492}},{"name":"Response","id":"response","schema":"optic:rest/response","snippet":{"language":"es7","block":"res.send(200, item)"},"value":{"code":{"type":"literal","at":{"astType":"Literal","range":{"start":9,"end":12}}}},"variables":{"item":"self","res":"self"},"range":{"start":2536,"end":2694}}],"containers":[],"transformations":[]},Map(PackageRef(optic:rest,0.1.0) -> PackageRef(optic:rest,0.1.0))),Tree(Vector(Leaf(OpticMDPackage({"info":{"author":"optic","package":"rest","version":"0.1.0"},"schemas":[{"id":"route","definition":{"title":"Route","type":"object","required":["method","url"],"properties":{"method":{"type":"string","enum":["get","post","put","delete","head","options"]},"url":{"type":"string"},"parameters":{"type":"array","items":{"$ref":"#/definitions/parameter"}}},"definitions":{"parameter":{"title":"Parameter","type":"object","required":["in","name"],"properties":{"in":{"type":"string"},"name":{"type":"string"}}}}},"range":{"start":184,"end":1149}},{"id":"parameter","definition":{"title":"Parameter","type":"object","required":["in","name"],"properties":{"in":{"type":"string"},"name":{"type":"string"}}},"range":{"start":1165,"end":1402}},{"id":"response","definition":{"title":"Response","type":"object","required":["in","name"],"properties":{"code":{"type":"number"}}},"range":{"start":1416,"end":1609}}],"lenses":[],"containers":[],"transformations":[]},Map()),Tree(Vector())))))))""")
  }

  it("can compile dependencies") {
    val output = SGConstructor.compileDependencyTree(SGConstructor.dependenciesForProjectFile(projectFile).get)
    assert(output.isSuccess)
  }

  it("can build a sourcegear instance") {
    lazy val sgConfig = {
      val future = SGConstructor.fromProjectFile(new ProjectFile(File("test-examples/resources/example_packages/express/optic.yml")))
      Await.result(future, 5 seconds)
    }
    assert(sgConfig.compiledLenses.size == 3)
  }

}

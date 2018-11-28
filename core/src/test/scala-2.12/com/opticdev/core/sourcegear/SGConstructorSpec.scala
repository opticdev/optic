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
    assert(SGConstructor.dependenciesForProjectFile(projectFile).get.toString == """Tree(Vector(Leaf(OpticMDPackage({"info":{"author":"apiatlas","package":"flat-express-js","version":"0.0.1","dependencies":{}},"lenses":[{"id":"express-parameter","snippet":{"block":"req.query.paramName","language":"es7"},"value":{"in":{"type":"token","at":{"astType":"Identifier","range":{"start":4,"end":9}}},"name":{"type":"token","at":{"astType":"Identifier","range":{"start":10,"end":19}}}},"variables":{"req":"scope"},"containers":{},"schema":"parameter","initialValue":{},"priority":1,"internal":false},{"id":"express-header-function-style","snippet":{"block":"req.get('X-Header')","language":"es7"},"value":{"name":{"type":"literal","at":{"astType":"Literal","range":{"start":8,"end":18}}}},"variables":{"req":"scope"},"containers":{},"schema":"parameter","initialValue":{"in":"header"},"priority":1,"internal":false},{"id":"express-header-bracket-style","snippet":{"block":"req.headers['X-Header']","language":"es7"},"value":{"name":{"type":"literal","at":{"astType":"Literal","range":{"start":12,"end":22}}}},"variables":{"req":"scope"},"containers":{},"schema":"parameter","initialValue":{"in":"header"},"priority":1,"internal":false},{"id":"express-response-default","snippet":{"block":"res.send(item)","language":"es7"},"value":{},"variables":{"res":"scope","item":"self"},"containers":{},"schema":"response","initialValue":{"status":200},"priority":1,"internal":false},{"id":"status-code-response","snippet":{"block":"res.status(200).send(item)","language":"es7"},"value":{"code":{"type":"literal","at":{"astType":"Literal","range":{"start":11,"end":14}}}},"variables":{"res":"scope","item":"self"},"containers":{},"schema":"response","initialValue":{},"priority":1,"internal":false},{"name":"Express Endpoint","id":"express-endpoint","snippet":{"block":"app.get('url', (req, res) => {\n\t//:handler\n})","language":"es7"},"value":{"method":{"type":"token","at":{"astType":"Identifier","range":{"start":4,"end":7}}},"url":{"type":"literal","at":{"astType":"Literal","range":{"start":8,"end":13}}},"parameters":{"schemaRef":"parameter","unique":true},"responses":{"schemaRef":"response","unique":true}},"variables":{"req":"self","res":"self"},"containers":{"handler":"any"},"schema":"endpoint","initialValue":{},"priority":1,"internal":false},{"name":"Express Handler","id":"express-handler","snippet":{"block":"(req, res) => {\n\t//:handler\n}","language":"es7"},"value":{"parameters":{"schemaRef":"parameter","unique":true},"responses":{"schemaRef":"response","unique":true}},"variables":{"req":"self","res":"self"},"containers":{"handler":"any"},"schema":{"_id":null,"_definition":{"title":"Express Handler","type":"object","required":["parameters","responses"],"properties":{}}},"initialValue":{},"priority":1,"internal":false},{"name":"Express Endpoint","id":"express-endpoint-reffed","snippet":{"block":"app.get('url', handler)","language":"es7"},"value":{"method":{"type":"token","at":{"astType":"Identifier","range":{"start":4,"end":7}}},"url":{"type":"literal","at":{"astType":"Literal","range":{"start":8,"end":13}}},"parameters":{"tokenAt":{"astType":"Identifier","range":{"start":15,"end":22}},"keyPath":"parameters","abstraction":"express-handler"},"responses":{"tokenAt":{"astType":"Identifier","range":{"start":15,"end":22}},"keyPath":"responses","abstraction":"express-handler"}},"variables":{},"containers":{},"schema":"endpoint","initialValue":{},"priority":1,"internal":false}],"schemas":[{"id":"parameter","definition":{"title":"Parameter","type":"object","required":["in","name"],"additionalProperties":false,"properties":{"in":{"type":"string","enum":["path","query","header","cookie"]},"name":{"type":"string"},"required":{"type":"boolean"},"schema":{"type":"object"}}}},{"id":"request-body","definition":{"title":"Request Body","type":"object","properties":{"content-type":{"type":"string","enum":["application/json","application/xml","application/x-www-form-urlencoded","text/plain"]},"schema":{"type":"object"}},"additionalProperties":false}},{"id":"response","definition":{"title":"Response","type":"object","required":["status"],"properties":{"status":{"type":"number"},"content-type":{"type":"string","enum":["application/json","application/xml","application/x-www-form-urlencoded","text/plain"]},"schema":{"type":"object"}},"additionalProperties":false}},{"id":"endpoint","definition":{"title":"Endpoint","type":"object","required":["url","method"],"additionalProperties":false,"properties":{"url":{"type":"string"},"method":{"type":"string","enum":["get","post","put","delete","options","head"]},"parameters":{"type":"array","items":{"title":"Parameter","type":"object","required":["in","name"],"additionalProperties":false,"properties":{"in":{"type":"string","enum":["path","query","header","cookie"]},"name":{"type":"string"},"required":{"type":"boolean"},"schema":{"type":"object"}}}},"body":{"title":"Request Body","type":"object","properties":{"content-type":{"type":"string","enum":["application/json","application/xml","application/x-www-form-urlencoded","text/plain"]},"schema":{"type":"object"}},"additionalProperties":false},"responses":{"type":"array","items":{"title":"Response","type":"object","required":["status"],"properties":{"status":{"type":"number"},"content-type":{"type":"string","enum":["application/json","application/xml","application/x-www-form-urlencoded","text/plain"]},"schema":{"type":"object"}},"additionalProperties":false}}}}}],"transformations":[]},Map()),Tree(Vector()))))""")
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
    assert(sgConfig.compiledLenses.size == 8)
  }

}

package com.opticdev.core.sourcegear.context

import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.sourcegear.{CompiledLens, SGConfig, SGConstructor, SourceGear}
import com.opticdev.opm.{PackageManager, TestPackageProviders}
import com.opticdev.sdk.skills_sdk.schema.OMSchema
import org.scalatest.FunSpec

import scala.concurrent.duration._
import scala.concurrent.Await

class FlatContextSpec extends TestBase with TestPackageProviders {

  lazy val dt = PackageManager.collectPackages(Seq(t.opticExpress.packageRef, t.a.packageRef)).get
  implicit lazy val config: SGConfig = Await.result(SGConstructor.fromDependencies(dt, Set(), Set(), Vector()), 10 seconds)
  implicit lazy val schemas = config.inflatedSchemas
  implicit lazy val lenses = config.compiledLenses
  it("can construct flat context from dependency tree") {
    val flatContext = FlatContextBuilder.fromDependencyTree(dt)

    assert(flatContext.mapping.size == 2)
    assert(flatContext.mapping("optic:express-js").asInstanceOf[FlatContext].mapping.keys == Set("route", "parameter", "optic:rest", "response"))

  }

  it("can lookup paths in flat context") {
    val flatContext = FlatContextBuilder.fromDependencyTree(dt)
    val expressJS = flatContext.resolve("optic:express-js").get.asInstanceOf[FlatContext]

    assert(expressJS.resolve("route").get.isInstanceOf[CompiledLens])
    assert(expressJS.resolve("/route").get.isInstanceOf[CompiledLens])
    assert(expressJS.resolve("//route").get.isInstanceOf[CompiledLens])
    assert(expressJS.resolve("optic:rest/route").get.isInstanceOf[OMSchema])
    assert(expressJS.resolve("optic:rest//route").get.isInstanceOf[OMSchema])
  }

  it("will not find non-existent paths") {
    val flatContext = FlatContextBuilder.fromDependencyTree(dt)

    assert(flatContext.resolve("not:real/one").isEmpty)
    assert(flatContext.resolve("not:real").isEmpty)
    assert(flatContext.resolve("fake / /fsd s// s").isEmpty)
    assert(flatContext.resolve("").isEmpty)
  }

  it("can prefix paths") {
    val flatContext = FlatContextBuilder.fromDependencyTree(dt)
    assert(flatContext.prefix("optic:express-js").resolve("route").get.isInstanceOf[CompiledLens])
  }

  it("can next prefixed paths") {
    val flatContext = FlatContextBuilder.fromDependencyTree(dt)
    val doublePrefixed = flatContext.prefix("optic:express-js").prefix("optic:rest")
    assert(doublePrefixed.resolve("route").get.isInstanceOf[OMSchema])
  }
}

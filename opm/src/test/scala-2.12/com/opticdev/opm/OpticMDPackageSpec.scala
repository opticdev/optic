package com.opticdev.opm

import better.files.File
import org.scalatest.FunSpec

class OpticMDPackageSpec extends FunSpec {

  lazy val testPackage = OpticMDPackage.fromMarkdown(File("test-examples/resources/example_markdown/Importing-JS.md"))

  it("initializes with valid markdown") {
    assert(testPackage.isSuccess)
  }

  it("finds schemas") {
    val schemas = testPackage.get.schemas
    assert(schemas.size == 1)
  }

  it("find lenses") {
    val lenses = testPackage.get.lenses
    assert(lenses.size == 2)
  }

}

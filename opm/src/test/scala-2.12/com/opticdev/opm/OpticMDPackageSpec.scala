package com.opticdev.opm

import better.files.File
import com.opticdev.opm.packages.OpticPackage
import org.scalatest.FunSpec

class OpticMDPackageSpec extends FunSpec {

  lazy val testPackage = OpticPackage.fromMarkdown(File("test-examples/resources/example_markdown/Importing-JS.md"))

  it("initializes with valid markdown") {
    assert(testPackage.isSuccess)
  }

  lazy val resolved = testPackage.get.resolved()

  it("finds schemas") {
    val schemas = resolved.schemas
    assert(schemas.size == 1)
  }

  it("find lenses") {
    val lenses = resolved.lenses
    assert(lenses.size == 1)
  }

}

package com.opticdev.core.compiler

import com.opticdev.core.Fixture.TestBase
import org.scalatest.FunSpec
import play.api.libs.json.Json
import com.opticdev.core.compiler.Compiler
import com.opticdev.opm.context.{Leaf, PackageContext, PackageContextFixture, Tree}
import com.opticdev.opm.{OpticMDPackage}

import scala.collection.mutable.ListBuffer
import scala.io.Source

class CompilerSpec extends TestBase {

  val jsonString = Source.fromFile("test-examples/resources/example_packages/optic:ImportExample@0.1.0.json").getLines.mkString
  val description = OpticMDPackage.fromJson(Json.parse(jsonString)).get

  implicit val dependencyTree = Tree(Leaf(description))

  implicit val packageContext = PackageContextFixture.fromSchemas(description.schemas)

  describe("can be setup") {

    it("with a test description") {
      val pool = Compiler.setup(description)
      assert(pool.compilers.size == 1)
    }
  }

  describe("for individual lenses") {

    it("works when valid") {
      val compiler = Compiler.setup(description)
      val finalOutput = compiler.execute

      assert(finalOutput.isSuccess)
      assert(!finalOutput.isFailure)
      assert(finalOutput.gears.size == 1)
      assert(finalOutput.errors.size == 0)

    }

  }

  describe("for complicated lenses") {
    it("works when valid") {
      val jsonString = Source.fromFile("test-examples/resources/example_packages/optic:FlatExpress@0.1.0.json").getLines.mkString
      val description = OpticMDPackage.fromJson(Json.parse(jsonString)).get
      implicit val dependencyTree = Tree(Leaf(description))

      val compiler = Compiler.setup(description)(false, dependencyTree)
      val finalOutput = compiler.execute

      finalOutput.printErrors
      assert(finalOutput.isSuccess)


    }
  }

}

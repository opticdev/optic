package com.opticdev.core.compiler

import com.opticdev.common.SchemaRef
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.Fixture.compilerUtils.ParserUtils
import org.scalatest.FunSpec
import play.api.libs.json.Json
import com.opticdev.core.compiler.Compiler
import com.opticdev.core.sourcegear.project.config.options.DefaultSettings
import com.opticdev.opm.context.{Leaf, PackageContext, PackageContextFixture, Tree}
import com.opticdev.opm.packages.OpticPackage

import scala.collection.mutable.ListBuffer
import scala.io.Source
import scala.util.hashing.Hashing.Default

class CompilerSpec extends TestBase with ParserUtils {

  val jsonString = Source.fromFile("test-examples/resources/example_packages/optic:ImportExample@0.1.0.json").getLines.mkString
  val description = OpticPackage.fromJson(Json.parse(jsonString)).get.resolved()

  implicit val dependencyTree = Tree(Leaf(description))

  implicit val packageContext = PackageContextFixture.fromSchemas(description.schemas)
  implicit val parserDefaults = Map.empty[SchemaRef, DefaultSettings]

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
      assert(finalOutput.errors.isEmpty)

    }

  }

  describe("for complicated lenses") {
    it("works when valid") {
      val jsonString = Source.fromFile("test-examples/resources/example_packages/optic:FlatExpress@0.1.0.json").getLines.mkString
      val description = OpticPackage.fromJson(Json.parse(jsonString)).get.resolved()
      implicit val dependencyTree = Tree(Leaf(description))

      val compiler = Compiler.setup(description)(false, dependencyTree, Map())
      val finalOutput = compiler.execute

      finalOutput.printErrors
      assert(finalOutput.isSuccess)

    }
  }
}

package com.opticdev.core.debug

import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.compiler.Compiler.CompileWorker
import com.opticdev.opm.TestPackageProviders
import com.opticdev.opm.context.{Leaf, PackageContextFixture, Tree}
import com.opticdev.opm.packages.OpticPackage
import play.api.libs.json.Json

import scala.io.Source

class SDKObjectsDebugSpec extends TestBase with TestPackageProviders {

  describe("Lens Debug Information") {

    lazy val importLens = new {
      private val jsonString = Source.fromFile("test-examples/resources/example_packages/optic:ImportExample@0.1.0.json").getLines.mkString
      private val description = OpticPackage.fromJson(Json.parse(jsonString)).get.resolved()
      implicit val dependencyTree = Tree(Leaf(description))
      implicit val packageContext = dependencyTree.treeContext(description.packageFull).get

      val lens = description.lenses.head
    }

    it("Is collected during compile") {
      val lensDebug = LensDebug.run(importLens.lens, importLens.packageContext)
      assert(lensDebug.isSuccess)
      assert(lensDebug.snippetStageError.isEmpty)
      assert(lensDebug.componentsInfo.get.isSuccess)
      assert(lensDebug.componentsInfo.get.found.size == 2)
      assert(lensDebug.containersInfo.get.isSuccess)
      assert(lensDebug.containersInfo.get.found.isEmpty)
      assert(lensDebug.containersInfo.get.notFound.isEmpty)
      assert(lensDebug.variables.isEmpty)
      assert(lensDebug.gearHash.contains("d6a759a5"))
    }

    it("Can be turned into JSON") {
      val lensDebug = LensDebug.run(importLens.lens, importLens.packageContext)
      assert(lensDebug.toJson == Json.parse("{\"isSuccess\":true,\"snippet\":{\"language\":\"es7\",\"block\":\"let definedAs = require('pathTo')\"},\"componentsInfo\":{\"isSuccess\":true,\"found\":[{\"component\":{\"propertyPath\":\"definedAs\",\"finder\":\"Entire definedAs \"},\"range\":{\"start\":4,\"end\":13}},{\"component\":{\"propertyPath\":\"pathTo\",\"finder\":\"Containing pathTo \"},\"range\":{\"start\":24,\"end\":32}}],\"notFound\":[]},\"containersInfo\":{\"isSuccess\":true,\"found\":[],\"notFound\":[]},\"variables\":[],\"gearHash\":\"d6a759a5\",\"sdkType\":\"lens\"}"))
    }

  }

}

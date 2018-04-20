package com.opticdev.opm.providers

import com.opticdev.common.PackageRef
import com.opticdev.opm.PackageManager
import com.opticdev.sdk.markdown.OpticMarkdownInstaller
import org.scalatest.{BeforeAndAfterAll, FunSpec}

import scala.concurrent.Await
import scala.concurrent.duration._

class OpticRegistryProviderSpec extends FunSpec with BeforeAndAfterAll {

  override def beforeAll(): Unit = {
    PackageManager.setProviders(com.opticdev.opm.defaultProviderSeq:_*)
  }

  describe("Optic Registry Provider") {

    val provider = new OpticRegistryProvider

    it("can download a package") {
      val future = provider.resolvePackages(PackageRef("test:A", "0.1.0"))
      val result = Await.result(future, 20 seconds)
      assert(result.foundAll)
      assert(result.found.head.packageId == "test:A")
    }

    it("can download a package with a fuzzy version") {
      val future = provider.resolvePackages(PackageRef("test:A", "latest"))
      val result = Await.result(future, 20 seconds)
      assert(result.foundAll)
      assert(result.found.head.packageId == "test:A")
      assert(result.found.head.version == "0.1.0")
    }

    it("will not find a package that does not exist") {
      val future = provider.resolvePackages(PackageRef("test:fakeeee"))
      val result = Await.result(future, 20 seconds)
      assert(!result.foundAll)
      assert(result.notFound.head == PackageRef("test:fakeeee"))
    }

    it("can download multiple packages") {
      val future = provider.resolvePackages(PackageRef("test:A", "0.1.0"), PackageRef("test:B", "0.1.0"))
      val result = Await.result(future, 20 seconds)
      assert(result.foundAll)
      assert(result.found.size == 2)
    }

  }

  describe("works within the package manager") {

    implicit val projectKnowledgeSearchPaths = ProjectKnowledgeSearchPaths()
    it("can install a set of nested dependencies") {
      val results = PackageManager.installPackages(PackageRef("test:AB", "latest"), PackageRef("test:B", "latest"))
      assert(results.get == Set("test:A@0.1.0", "test:AB@0.1.0", "test:B@0.1.0"))
    }

    it("can install a set of dependencies") {
      val results = PackageManager.installPackages(PackageRef("test:A", "latest"), PackageRef("test:B", "latest"))
      assert(results.get == Set("test:A@0.1.0", "test:B@0.1.0"))
    }

  }


}

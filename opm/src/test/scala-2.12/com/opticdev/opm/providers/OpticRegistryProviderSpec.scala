package com.opticdev.opm.providers

import com.opticdev.common.PackageRef
import com.opticdev.opm.PackageManager
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
      val future = provider.resolvePackages(PackageRef("test:a", "0.1.0"))
      val result = Await.result(future, 20 seconds)
      assert(result.foundAll)
      assert(result.found.head.packageId == "test:a")
    }

    it("can download a package with a fuzzy version") {
      val future = provider.resolvePackages(PackageRef("test:a", "latest"))
      val result = Await.result(future, 20 seconds)
      assert(result.foundAll)
      assert(result.found.head.packageId == "test:a")
      assert(result.found.head.version == "0.1.0")
    }

    it("will not find a package that does not exist") {
      val future = provider.resolvePackages(PackageRef("test:fakeeee"))
      val result = Await.result(future, 20 seconds)
      assert(!result.foundAll)
      assert(result.notFound.head == PackageRef("test:fakeeee"))
    }

    it("can download multiple packages") {
      val future = provider.resolvePackages(PackageRef("test:a", "0.1.0"), PackageRef("test:b", "0.1.0"))
      val result = Await.result(future, 20 seconds)
      assert(result.foundAll)
      assert(result.found.size == 2)
    }

  }

  describe("works within the package manager") {

    implicit val projectKnowledgeSearchPaths = ProjectKnowledgeSearchPaths()
    it("can install a set of nested dependencies") {
      val results = PackageManager.installPackages(PackageRef("test:ab", "latest"), PackageRef("test:b", "latest"))
      assert(results.get == Set("test:a@0.1.0", "test:ab@0.1.0", "test:b@0.1.0"))
    }

    it("can install a set of dependencies") {
      val results = PackageManager.installPackages(PackageRef("test:a", "latest"), PackageRef("test:b", "latest"))
      assert(results.get == Set("test:a@0.1.0", "test:b@0.1.0"))
    }

  }


}

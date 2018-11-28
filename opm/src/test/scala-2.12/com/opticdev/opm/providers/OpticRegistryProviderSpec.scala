package com.opticdev.opm.providers

import com.opticdev.common.PackageRef
import com.opticdev.opm.PackageManager
import org.scalatest.{BeforeAndAfterAll, FunSpec}

import scala.concurrent.Await
import scala.concurrent.duration._

class OpticRegistryProviderSpec extends FunSpec with BeforeAndAfterAll {

  implicit val excludeFromCache : Seq[PackageRef] = Seq()

  override def beforeAll(): Unit = {
    PackageManager.setProviders(com.opticdev.opm.defaultProviderSeq:_*)
  }

  describe("Optic Registry Provider") {

    val provider = new OpticRegistryProvider

    it("can download a package") {
      val future = provider.resolvePackages(PackageRef("apiatlas:schemas", "0.0.1"))
      val result = Await.result(future, 20 seconds)
      assert(result.foundAll)
      assert(result.found.head.packageId == "apiatlas:schemas")
    }

    it("can download a package with a fuzzy version") {
      val future = provider.resolvePackages(PackageRef("apiatlas:schemas", "latest"))
      val result = Await.result(future, 20 seconds)
      assert(result.foundAll)
      assert(result.found.head.packageId == "apiatlas:schemas")
    }

    it("will not find a package that does not exist") {
      val future = provider.resolvePackages(PackageRef("test:fakeeee"))
      val result = Await.result(future, 20 seconds)
      assert(!result.foundAll)
      assert(result.notFound.head == PackageRef("test:fakeeee"))
    }

    it("can download multiple packages") {
      val future = provider.resolvePackages(PackageRef("apiatlas:schemas", "latest"), PackageRef("apiatlas:express-js", "latest"))
      val result = Await.result(future, 20 seconds)
      assert(result.foundAll)
      assert(result.found.size == 2)
    }

  }

  describe("works within the package manager") {

    it("can install a set of nested dependencies") {
      val results = PackageManager.installPackages(PackageRef("apiatlas:express-js", "0.0.1"))
      assert(results.get == Set("apiatlas:schemas@0.0.1", "apiatlas:express-js@0.0.1"))
    }

    it("can install a set of dependencies") {
      val results = PackageManager.installPackages(PackageRef("apiatlas:schemas", "latest"), PackageRef("apiatlas:express-js", "latest"))
      assert(results.get == Set("apiatlas:schemas@0.0.1", "apiatlas:express-js@0.0.1"))
    }

  }


}

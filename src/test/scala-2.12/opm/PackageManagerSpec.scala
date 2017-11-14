package opm

import com.opticdev.opm.{PackageManager, PackageRef, PackageStorage}
import org.scalatest.{BeforeAndAfter, FunSpec}

import scala.concurrent.Await
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._

class PackageManagerSpec extends FunSpec with BeforeAndAfter {

  describe("Package Manager") {

    val testProvider = new TestProvider()
    PackageManager.setProviders(testProvider)

    before {
      PackageStorage.clearLocalPackages
    }

    it("can change providers") {
      assert(PackageManager.providers.size == 1)
    }

    describe("will install") {

      it("a single package w/Dependencies") {

        val installTry = PackageManager.installPackage(PackageRef("optic:a", "1.1.1"))

        assert(installTry.get ==
          Vector(
            "optic:a@1.1.1",
            "optic:b@1.0.0",
            "optic:c@2.0.0",
            "optic:c@3.5.2",
            "optic:d@2.0.0",
            "optic:e@2.0.0"))
      }

      it("a list of packages") {
        val installTry = PackageManager.installPackages(
          PackageRef("optic:a", "1.1.1"),
          PackageRef("optic:b", "1.1.1"))

        assert(installTry.get ==  Vector(
          "optic:a@1.1.1",
          "optic:b@1.0.0",
          "optic:b@1.1.1",
          "optic:c@2.0.0",
          "optic:c@3.5.2",
          "optic:d@2.0.0",
          "optic:e@2.0.0"))
      }

      it("works for fuzzy versions") {
        val installTry = PackageManager.installPackage(PackageRef("optic:a", "~1.1.0"))

        assert(installTry.get ==
          Vector(
            "optic:a@1.1.1",
            "optic:b@1.0.0",
            "optic:c@2.0.0",
            "optic:c@3.5.2",
            "optic:d@2.0.0",
            "optic:e@2.0.0"))
      }

    }

  }

}

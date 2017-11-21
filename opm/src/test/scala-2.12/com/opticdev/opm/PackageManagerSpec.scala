package com.opticdev.opm

import com.opticdev.common.PackageRef
import com.opticdev.opm.PackageManager
import com.opticdev.opm.context.{Leaf, Tree}
import com.opticdev.opm.storage.PackageStorage
import org.scalatest.{BeforeAndAfter, FunSpec}

import scala.concurrent.Await
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._

class PackageManagerSpec extends FunSpec with BeforeAndAfter with TestPackageProviders {

  describe("Package Manager") {

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

    describe("collect packages") {

      it("works when all are valid") {
        val collectTry = PackageManager.collectPackages(Seq(
          PackageRef("optic:a", "1.1.1"),
          PackageRef("optic:b", "1.1.1")))

        val expectedTree = Tree(
          Leaf(t.a, Tree(
            Leaf(t.b, Tree(
              Leaf(t.c, Tree(
                Leaf(t.d, Tree(
                  Leaf(t.e, Tree(
                    Leaf(t.c1)
                  ))
                ))
              )),
              Leaf(t.d, Tree(
                Leaf(t.e, Tree(
                  Leaf(t.c1)
                ))
              )
            )
          )))),
          Leaf(t.b1, Tree(
            Leaf(t.c1)
          ))
        )

        assert(collectTry.get == expectedTree)
        assert(collectTry.get.flatten.toSet == Set(t.a, t.b, t.b1, t.c, t.c1, t.d, t.e))
      }

      it("fails if any can not be resolved") {
        val collectTry = PackageManager.collectPackages(Seq(
          PackageRef("optic:b", "1.1.1"),
          PackageRef("optic:abc", "1.1.1"))
        )

        println(collectTry)
        assert(collectTry.isFailure)

      }


    }

  }

}

package com.opticdev.opm

import better.files.File
import com.opticdev.common.PackageRef
import com.opticdev.opm.context.{Leaf, Tree}
import com.opticdev.opm.providers.ProjectKnowledgeSearchPaths
import com.opticdev.opm.storage.{PackageStorage, ParserStorage}
import com.opticdev.parsers.ParserRef
import org.scalatest.{BeforeAndAfter, BeforeAndAfterAll, FunSpec}

import scala.concurrent.Await
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._

class PackageManagerSpec extends FunSpec with TestPackageProviders {

  implicit val projectKnowledgeSearchPaths: ProjectKnowledgeSearchPaths = ProjectKnowledgeSearchPaths()

  describe("Package Manager") {

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
          Leaf(t.a.resolved(), Tree(
            Leaf(t.b.resolved(), Tree(
              Leaf(t.c.resolved(), Tree(
                Leaf(t.d.resolved(), Tree(
                  Leaf(t.e.resolved(), Tree(
                    Leaf(t.c1.resolved())
                  ))
                ))
              )),
              Leaf(t.d.resolved(), Tree(
                Leaf(t.e.resolved(), Tree(
                  Leaf(t.c1.resolved())
                ))
              )
            )
          )))),
          Leaf(t.b1.resolved(), Tree(
            Leaf(t.c1.resolved())
          ))
        )

        assert(expectedTree.toString == "Tree(WrappedArray(Leaf(OpticMDPackage({\"metadata\":{\"name\":\"a\",\"version\":\"1.1.1\",\"author\":\"optic\"},\"dependencies\":[\"optic:b@1.0.0\"]},Map()),Tree(WrappedArray(Leaf(OpticMDPackage({\"metadata\":{\"name\":\"b\",\"version\":\"1.0.0\",\"author\":\"optic\"},\"dependencies\":[\"optic:c@3.5.2\",\"optic:d@2.0.0\"]},Map()),Tree(WrappedArray(Leaf(OpticMDPackage({\"metadata\":{\"name\":\"c\",\"version\":\"3.5.2\",\"author\":\"optic\"},\"dependencies\":[\"optic:d@2.0.0\"]},Map()),Tree(WrappedArray(Leaf(OpticMDPackage({\"metadata\":{\"name\":\"d\",\"version\":\"2.0.0\",\"author\":\"optic\"},\"dependencies\":[\"optic:e@2.0.0\"]},Map()),Tree(WrappedArray(Leaf(OpticMDPackage({\"metadata\":{\"name\":\"e\",\"version\":\"2.0.0\",\"author\":\"optic\"},\"dependencies\":[\"optic:c@2.0.0\"]},Map()),Tree(WrappedArray(Leaf(OpticMDPackage({\"metadata\":{\"name\":\"c\",\"version\":\"2.0.0\",\"author\":\"optic\"},\"dependencies\":[]},Map()),Tree(List()))))))))))), Leaf(OpticMDPackage({\"metadata\":{\"name\":\"d\",\"version\":\"2.0.0\",\"author\":\"optic\"},\"dependencies\":[\"optic:e@2.0.0\"]},Map()),Tree(WrappedArray(Leaf(OpticMDPackage({\"metadata\":{\"name\":\"e\",\"version\":\"2.0.0\",\"author\":\"optic\"},\"dependencies\":[\"optic:c@2.0.0\"]},Map()),Tree(WrappedArray(Leaf(OpticMDPackage({\"metadata\":{\"name\":\"c\",\"version\":\"2.0.0\",\"author\":\"optic\"},\"dependencies\":[]},Map()),Tree(List())))))))))))))), Leaf(OpticMDPackage({\"metadata\":{\"name\":\"b\",\"version\":\"1.1.1\",\"author\":\"optic\"},\"dependencies\":[\"optic:c@2.0.0\"]},Map()),Tree(WrappedArray(Leaf(OpticMDPackage({\"metadata\":{\"name\":\"c\",\"version\":\"2.0.0\",\"author\":\"optic\"},\"dependencies\":[]},Map()),Tree(List())))))))")
      }

      it("fails if any can not be resolved") {
        val collectTry = PackageManager.collectPackages(Seq(
          PackageRef("optic:b", "1.1.1"),
          PackageRef("optic:abc", "1.1.1"))
        )

        assert(collectTry.isFailure)
      }


    }

//    it("collects parsers") {
//
//      val fakeParserJar = File("test-examples/resources/example_parsers/fake-parser-0.1.0.jar")
//      ParserStorage.clearLocalParsers
//      ParserStorage.writeToStorage(fakeParserJar)
//
//      val collect = PackageManager.collectParsers(
//        ParserRef("es7", "0.1.0")
//      )
//
//      assert(collect.foundAll)
//      assert(collect.found.size == 1)
//
//    }

  }

}

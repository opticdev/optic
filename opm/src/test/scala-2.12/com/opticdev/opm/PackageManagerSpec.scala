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

        val installTry = PackageManager.installPackage(PackageRef("optic:aaaa", "1.1.1"))

        assert(installTry.get ==
          Set(
            "optic:aaaa@1.1.1",
            "optic:bbbb@1.0.0",
            "optic:cccc@2.0.0",
            "optic:cccc@3.5.2",
            "optic:dddd@2.0.0",
            "optic:eeee@2.0.0"))
      }

      it("a list of packages") {
        val installTry = PackageManager.installPackages(
          PackageRef("optic:aaaa", "1.1.1"),
          PackageRef("optic:bbbb", "1.1.1"))

        assert(installTry.get ==  Set(
          "optic:aaaa@1.1.1",
          "optic:bbbb@1.0.0",
          "optic:bbbb@1.1.1",
          "optic:cccc@2.0.0",
          "optic:cccc@3.5.2",
          "optic:dddd@2.0.0",
          "optic:eeee@2.0.0"))
      }

      it("works for fuzzy versions") {
        val installTry = PackageManager.installPackage(PackageRef("optic:aaaa", "~1.1.0"))

        assert(installTry.get ==
          Set(
            "optic:aaaa@1.1.1",
            "optic:bbbb@1.0.0",
            "optic:cccc@2.0.0",
            "optic:cccc@3.5.2",
            "optic:dddd@2.0.0",
            "optic:eeee@2.0.0"))
      }

    }

    describe("collect packages") {

      it("works when all are valid") {
        val collectTry = PackageManager.collectPackages(Seq(
          PackageRef("optic:aaaa", "1.1.1"),
          PackageRef("optic:bbbb", "1.1.1")))

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

        assert(expectedTree.toString == "Tree(WrappedArray(Leaf(OpticMDPackage({\"info\":{\"author\":\"optic\",\"package\":\"aaaa\",\"version\":\"1.1.1\",\"dependencies\":[\"optic:bbbb@1.0.0\"]}},Map()),Tree(WrappedArray(Leaf(OpticMDPackage({\"info\":{\"author\":\"optic\",\"package\":\"bbbb\",\"version\":\"1.0.0\",\"dependencies\":[\"optic:cccc@3.5.2\",\"optic:dddd@2.0.0\"]}},Map()),Tree(WrappedArray(Leaf(OpticMDPackage({\"info\":{\"author\":\"optic\",\"package\":\"cccc\",\"version\":\"3.5.2\",\"dependencies\":[\"optic:dddd@2.0.0\"]}},Map()),Tree(WrappedArray(Leaf(OpticMDPackage({\"info\":{\"author\":\"optic\",\"package\":\"dddd\",\"version\":\"2.0.0\",\"dependencies\":[\"optic:eeee@2.0.0\"]}},Map()),Tree(WrappedArray(Leaf(OpticMDPackage({\"info\":{\"author\":\"optic\",\"package\":\"eeee\",\"version\":\"2.0.0\",\"dependencies\":[\"optic:cccc@2.0.0\"]}},Map()),Tree(WrappedArray(Leaf(OpticMDPackage({\"info\":{\"author\":\"optic\",\"package\":\"cccc\",\"version\":\"2.0.0\",\"dependencies\":[]}},Map()),Tree(List()))))))))))), Leaf(OpticMDPackage({\"info\":{\"author\":\"optic\",\"package\":\"dddd\",\"version\":\"2.0.0\",\"dependencies\":[\"optic:eeee@2.0.0\"]}},Map()),Tree(WrappedArray(Leaf(OpticMDPackage({\"info\":{\"author\":\"optic\",\"package\":\"eeee\",\"version\":\"2.0.0\",\"dependencies\":[\"optic:cccc@2.0.0\"]}},Map()),Tree(WrappedArray(Leaf(OpticMDPackage({\"info\":{\"author\":\"optic\",\"package\":\"cccc\",\"version\":\"2.0.0\",\"dependencies\":[]}},Map()),Tree(List())))))))))))))), Leaf(OpticMDPackage({\"info\":{\"author\":\"optic\",\"package\":\"bbbb\",\"version\":\"1.1.1\",\"dependencies\":[\"optic:cccc@2.0.0\"]}},Map()),Tree(WrappedArray(Leaf(OpticMDPackage({\"info\":{\"author\":\"optic\",\"package\":\"cccc\",\"version\":\"2.0.0\",\"dependencies\":[]}},Map()),Tree(List())))))))")
      }

      it("fails if any can not be resolved") {
        val collectTry = PackageManager.collectPackages(Seq(
          PackageRef("optic:bbbb", "1.1.1"),
          PackageRef("optic:aaaabc", "1.1.1"))
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

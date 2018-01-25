package com.opticdev.opm.context

import com.opticdev.opm.TestPackageProviders
import org.scalatest.FunSpec
class DependencyTreeSpec extends FunSpec with TestPackageProviders {

  describe("Dependency Tree") {

    val exampleTree = Tree(
      Leaf(t.a, Tree(
        Leaf(t.b, Tree(
          Leaf(t.c, Tree(
            Leaf(t.d, Tree(
              Leaf(t.e, Tree(
                Leaf(t.c1)
              ))
            ))
          ))
        )))),
      Leaf(t.b1, Tree(
        Leaf(t.c1),
        Leaf(t.opticRest)
      ))
    )

    it("can be flattened") {
      assert(exampleTree.flatten ==
        Set(t.a, t.b, t.b1, t.c, t.c1, t.d, t.e, t.opticRest))
    }

    it("can have all schemas flattened") {
      assert(exampleTree.flattenSchemas ==
        t.opticRest.schemas.toSet)
    }

    describe("leaf") {

      it("can get direct dependencies") {
        exampleTree.leafs.head.directDependencies == Set(t.b)
      }

      it("can get all dependencies") {
        exampleTree.leafs.head.allDependencies == Set(t.b, t.c, t.c1, t.d, t.e)
      }

    }

    describe("hashing") {

      it("guarantees unique trees") {
        val otherTree = Tree(Leaf(t.a))
        assert(exampleTree.hash != otherTree.hash)
      }

    }

  }

}

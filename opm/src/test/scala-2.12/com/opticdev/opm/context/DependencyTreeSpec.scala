package com.opticdev.opm.context

import com.opticdev.opm.TestPackageProviders
import org.scalatest.FunSpec
class DependencyTreeSpec extends FunSpec with TestPackageProviders {

    val exampleTree = Tree(
      Leaf(t.a.resolved(), Tree(
        Leaf(t.b.resolved(), Tree(
          Leaf(t.c.resolved(), Tree(
            Leaf(t.d.resolved(), Tree(
              Leaf(t.e.resolved(), Tree(
                Leaf(t.c1.resolved())
              ))
            ))
          ))
        )))),
      Leaf(t.b1.resolved(), Tree(
        Leaf(t.c1.resolved()),
        Leaf(t.opticRest.resolved())
      ))
    )

    it("can be flattened") {
//      println(exampleTree.flatten)
            assert(exampleTree.flatten ==
              Set(t.a.resolved(),
                t.b.resolved(),
                t.b1.resolved(),
                t.c.resolved(),
                t.c1.resolved(),
                t.d.resolved(),
                t.e.resolved(),
                t.opticRest.resolved()
              ))
    }

    it("can have all schemas flattened") {
      assert(exampleTree.flattenSchemas ==
        t.opticRest.resolved().schemas.toSet)
    }

  describe("leaf") {

    it("can get direct dependencies") {
      exampleTree.leafs.head.directDependencies == Set(t.b.resolved())
    }

    it("can get all dependencies") {
      exampleTree.leafs.head.allDependencies == Set(t.b.resolved(),
        t.c.resolved(),
        t.c1.resolved(),
        t.d.resolved(),
        t.e.resolved()
      )
    }

  }

  describe("hashing") {
    it("guarantees unique trees") {
      val otherTree = Tree(Leaf(t.a.resolved()))
      assert(exampleTree.hash != otherTree.hash)
    }
  }


}

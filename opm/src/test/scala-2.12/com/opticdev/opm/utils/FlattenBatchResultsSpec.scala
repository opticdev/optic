package com.opticdev.opm.utils

import com.opticdev.opm.{BatchPackageResult, OpticPackage, PackageRef, TestProvider}
import org.scalatest.FunSpec

class FlattenBatchResultsSpec extends FunSpec {


  //This is how we lookup something across multiple providers, select, and order it accordingly
  describe("Seq of Set Flattening") {
    case class TestItem(name: String, value: Int)

    val setA = Set(TestItem("A", 1), TestItem("B", 1), TestItem("C", 1), TestItem("D", 1))
    val setB = Set(TestItem("B", 2), TestItem("C", 2))
    val setC = Set(TestItem("A", 2), TestItem("E", 1))
    val setD = Set(TestItem("F", 1))

    val seq = Seq(setA, setB, setC, setD)

    it("prioritizes items from left -> right") {
      import com.opticdev.opm.utils.FlattenBatchResultsImplicits._

      val results = seq.flattenSequenceWith(i=> i.name)

      assert(results == Set(
        TestItem("A", 1),
        TestItem("B", 1),
        TestItem("C", 1),
        TestItem("D", 1),
        TestItem("E", 1),
        TestItem("F", 1)
      ))

    }
  }

  describe("Batch Results Flattening") {

    val t = new TestProvider()

    it("works & respects priority") {
      val first = BatchPackageResult(Set(t.a, t.b), Set(PackageRef("fake", "1.1.1")))
      val second = BatchPackageResult(Set(t.b, t.c, t.d), Set(PackageRef("fake", "1.1.2")))

      import com.opticdev.opm.utils.FlattenBatchResultsImplicits._
      val results = Seq(first, second).flattenResults

      assert(results.found == Set(t.a, t.b, t.c, t.d))
      assert(results.notFound == Set(PackageRef("fake", "1.1.1"), PackageRef("fake", "1.1.2")))
    }

    it("erases all not founds resolved by another provider") {
      val first = BatchPackageResult(Set(t.a), Set(t.b.packageRef))
      val second = BatchPackageResult(Set(t.b), Set(t.a.packageRef))

      import com.opticdev.opm.utils.FlattenBatchResultsImplicits._
      val results = Seq(first, second).flattenResults

      assert(results.found == Set(t.a, t.b))
      assert(results.notFound == Set())
    }

  }

}

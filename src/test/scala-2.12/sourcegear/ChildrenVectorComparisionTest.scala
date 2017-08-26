package sourcegear

import org.scalatest.FunSpec
import play.api.libs.json.JsString
import sourcegear.gears.MatchResults
import sourcegear.gears.helpers.{ChildrenVectorComparison, ModelField}

class ChildrenVectorComparisonTest extends FunSpec {
  describe("Children Vector Comparison") {

    def stringEquality(a: String, b: String) = MatchResults(a == b,
      //simulated extraction
      {if (a == b) Option(Set(ModelField(b, JsString(a)))) else None})

    describe("Any") {
      it("matches anything") {

        val result = ChildrenVectorComparison.samePlus[String, String](
          Vector("A", "C", "F", "Q", "Z"),
          Vector(),
          stringEquality
        )

        assert(result.isMatch)

      }
    }

    describe("Exact") {
      it("matches same vector") {

        val result = ChildrenVectorComparison.exact[String, String](
          Vector("A", "B", "C"),
          Vector("A", "B", "C"),
          stringEquality
        )

        assert(result.isMatch)
        assert(result.extracted.isDefined)
        assert(result.extracted.get.size == 3)
      }

      it("fails on different vectors") {

        val result = ChildrenVectorComparison.exact[String, String](
          Vector("A", "B", "C"),
          Vector("A"),
          stringEquality
        )

        assert(!result.isMatch)
        assert(result.extracted.isEmpty)

      }

    }


    describe("SamePlus") {

      it("matches on identical vectors") {

        val result = ChildrenVectorComparison.samePlus[String, String](
          Vector("A", "B", "C"),
          Vector("A", "B", "C"),
          stringEquality
        )

        assert(result.isMatch)
        assert(result.extracted.isDefined)
        assert(result.extracted.get.size == 3)

      }

      it("matches when empty") {

        val result = ChildrenVectorComparison.samePlus[String, String](
          Vector(),
          Vector(),
          stringEquality
        )

        assert(result.isMatch)
        assert(result.extracted.isEmpty)

      }

      it("matches when extra items are added") {

        val result = ChildrenVectorComparison.samePlus[String, String](
          Vector("A", "B", "1", "C", "2"),
          Vector("A", "B", "C"),
          stringEquality
        )

        assert(result.isMatch)
        assert(result.extracted.isDefined)
        assert(result.extracted.get.size == 3)

      }

      it("matches when extra duplicate items are added out of order") {

        val result = ChildrenVectorComparison.samePlus[String, String](
          Vector("B", "A", "B", "1", "C", "2"),
          Vector("A", "B", "C"),
          stringEquality
        )

        assert(result.isMatch)
        assert(result.extracted.isDefined)
        assert(result.extracted.get.size == 3)

      }

      it("does not match if a key item is missing") {
        val result = ChildrenVectorComparison.samePlus[String, String](
          Vector("A", "B"),
          Vector("A", "B", "C"),
          stringEquality
        )

        assert(!result.isMatch)
        assert(result.extracted.isEmpty)

      }

      it("does not match if a key item is missing and extra items are added") {
        val result = ChildrenVectorComparison.samePlus[String, String](
          Vector("A", "2", "B", "3"),
          Vector("A", "B", "C"),
          stringEquality
        )

        assert(!result.isMatch)
        assert(result.extracted.isEmpty)

      }

    }

    describe("SameAnyOrder") {

      it("matches when same order") {
        val result = ChildrenVectorComparison.sameAnyOrder[String, String](
          Vector("A", "B", "C"),
          Vector("A", "B", "C"),
          stringEquality
        )

        assert(result.isMatch)
        assert(result.extracted.isDefined)
        assert(result.extracted.get.size == 3)


      }

      it("matches when reversed order") {
        val result = ChildrenVectorComparison.sameAnyOrder[String, String](
          Vector("A", "B", "C").reverse,
          Vector("A", "B", "C"),
          stringEquality
        )

        assert(result.isMatch)

        assert(result.extracted.isDefined)
        assert(result.extracted.get.size == 3)

      }

      it("matches when in random order") {
        val result = ChildrenVectorComparison.sameAnyOrder[String, String](
          Vector("B", "A", "C").reverse,
          Vector("A", "C", "B"),
          stringEquality
        )

        assert(result.isMatch)

        assert(result.extracted.isDefined)
        assert(result.extracted.get.size == 3)

      }

      it("matches with duplicates") {
        val result = ChildrenVectorComparison.sameAnyOrder[String, String](
          Vector("A", "B", "B", "C"),
          Vector("A", "B", "B", "C"),
          stringEquality
        )

        assert(result.isMatch)

        assert(result.extracted.isDefined)
        assert(result.extracted.get.size == 3)

      }

      it("matches with duplicates any order") {
        val result = ChildrenVectorComparison.sameAnyOrder[String, String](
          Vector("B", "A", "B", "C"),
          Vector("A", "B", "C", "B"),
          stringEquality
        )

        assert(result.isMatch)

        assert(result.extracted.isDefined)
        assert(result.extracted.get.size == 3)

      }

      it("does not match when different number of items") {
        val result = ChildrenVectorComparison.sameAnyOrder[String, String](
          Vector("A", "B"),
          Vector("A", "B", "C"),
          stringEquality
        )

        assert(!result.isMatch)
        assert(result.extracted.isEmpty)

      }

      it("does not match when different items") {
        val result = ChildrenVectorComparison.sameAnyOrder[String, String](
          Vector("A", "B", "D"),
          Vector("A", "B", "C"),
          stringEquality
        )

        assert(!result.isMatch)
        assert(result.extracted.isEmpty)


      }

    }

    describe("SameAnyOrderPlus") {


      it("matches with an extra item") {
        val result = ChildrenVectorComparison.sameAnyOrderPlus[String, String](
          Vector("A", "B", "C", "D"),
          Vector("A", "B", "C"),
          stringEquality
        )

        assert(result.isMatch)
        assert(result.extracted.isDefined)
        assert(result.extracted.get.size == 3)
      }

      it("matches with an extra item reversed") {
        val result = ChildrenVectorComparison.sameAnyOrderPlus[String, String](
          Vector("A", "B", "C", "D").reverse,
          Vector("A", "B", "C"),
          stringEquality
        )

        assert(result.isMatch)
        assert(result.extracted.isDefined)
        assert(result.extracted.get.size == 3)
      }

      it("fails when item is missing") {
        val result = ChildrenVectorComparison.sameAnyOrderPlus[String, String](
          Vector("A", "B"),
          Vector("A", "B", "C"),
          stringEquality
        )

        assert(!result.isMatch)
        assert(result.extracted.isEmpty)

      }

      it("fails when one item is replaced by a different one") {
        val result = ChildrenVectorComparison.sameAnyOrderPlus[String, String](
          Vector("A", "B", "D"),
          Vector("A", "B", "C"),
          stringEquality
        )

        assert(!result.isMatch)
        assert(result.extracted.isEmpty)

      }


    }

  }


}

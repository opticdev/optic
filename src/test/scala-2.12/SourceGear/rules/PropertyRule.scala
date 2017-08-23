package SourceGear.rules

import org.scalatest.FunSpec
import play.api.libs.json.JsString
import sourcegear.rules.CompareTo
import sourcegear.rules.PropertyRule
class PropertyRule extends FunSpec {

  describe("Property Rules") {

    describe("CompareTo") {
      describe("ANY") {
        it("Accepts all") {
          assert(PropertyRule("key", CompareTo(JsString("myName"), "ANY")).evaluate(JsString("realName")))
          assert(PropertyRule("key", CompareTo(JsString("myName"), "ANY")).evaluate(JsString("myName")))
          assert(PropertyRule("key", CompareTo(JsString("other"), "ANY")).evaluate(JsString("myName")))
        }
      }
    }

    describe("==") {
      it("Accepts equal values") {
        assert(PropertyRule("key", CompareTo(JsString("myName"), "==")).evaluate(JsString("myName")))
        assert(PropertyRule("key", CompareTo(JsString("other"), "==")).evaluate(JsString("other")))
      }

      it("Rejects non-equal values") {
        assert(!PropertyRule("key", CompareTo(JsString("myName"), "==")).evaluate(JsString("wrong")))
      }
    }

    describe("!=") {
      it("Accepts equal values") {
        assert(PropertyRule("key", CompareTo(JsString("myName"), "!=")).evaluate(JsString("other")))
      }

      it("Rejects equal values") {
        assert(!PropertyRule("key", CompareTo(JsString("myName"), "!=")).evaluate(JsString("myName")))
      }
    }

    describe("invalid comparator") {
      it("rejects all, gracefully") {
        assert(PropertyRule("key", CompareTo(JsString("myName"), "clearly not a thing")).evaluate(JsString("value")))
      }
    }


  }

}

package com.opticdev.server.http.routes.query

import com.opticdev.server.http.routes.query.{Equals, NotEqual, OneOf, ValuePredicate}
import org.scalatest.FunSpec
import play.api.libs.json.{JsBoolean, JsNumber, JsString, Json}

class ValuePredicateTest extends FunSpec {
  describe("Value Predicates") {

    describe("parse from JSON") {

      it("works for equals expressions") {
        val json = Json.parse("""{ "key": "prop.prop1", "op": "==", "value": "Hello!" }""")
        assert(ValuePredicate.fromJson(json) == Equals(Seq("prop", "prop1"), JsString("Hello!")))
      }

      it("works for not equals expressions") {
        val json = Json.parse("""{ "key": "prop.prop1", "op": "!=", "value": "Hello!" }""")
        assert(ValuePredicate.fromJson(json) == NotEqual(Seq("prop","prop1"), JsString("Hello!")))
      }

      it("works for not oneOf expressions") {
        val json = Json.parse("""{ "key": "prop.prop1", "op": "oneOf", "values": ["Hello!", 15, false] }""")
        assert(ValuePredicate.fromJson(json) == OneOf(Seq("prop","prop1"), Set(JsString("Hello!"), JsNumber(15), JsBoolean(false))))
      }
    }

    describe("fail to parse") {

      it("when no value specified") {
        val json = Json.parse("""{ "key": "prop.prop1", "op": "==" }""")
        assertThrows[Exception] {
          ValuePredicate.fromJson(json)
        }
      }

      it("when no values specified") {
        val json = Json.parse("""{ "key": "prop.prop1", "op": "oneOf", "value": "Hello!" }""")
        assertThrows[Exception] {
          ValuePredicate.fromJson(json)
        }
      }

      it("when invalid op") {
        val json = Json.parse("""{ "key": "prop.prop1", "op": "noIMPL" }""")
        assertThrows[Exception] {
          ValuePredicate.fromJson(json)
        }
      }

    }

  }

}

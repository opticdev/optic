package sourcegear.helpers

import org.scalatest.FunSpec
import play.api.libs.json._
import sourcegear.gears.helpers.{FlattenModelFields, ModelField}

class FlattenModelFieldsTest extends FunSpec {

  val flat = Set(
    ModelField("one", JsString("value1")),
    ModelField("two", JsBoolean(false)),
    ModelField("three", JsNumber(3))
  )

  val nested = Set(
    ModelField("one", JsString("value1")),
    ModelField("two", JsString("value2")),
    ModelField("three.one", JsString("value3-1")),
    ModelField("three.two.one", JsString("value3-2-1"))
  )


  describe("Flatten model fields") {

    it("Can create JsObject from flat fields") {

      val expected = Json.parse("""
            {
              "one" : "value1",
              "two" : false,
              "three" : 3
            } """)

      assert(FlattenModelFields.flattenFields(flat) == expected)
    }

    it("Can can merge onto an existing object") {
      val expected = Json.parse("""
            {
              "existingField" : true,
              "one" : "value1",
              "two" : false,
              "three" : 3
            } """)

      assert(FlattenModelFields.flattenFields(flat, JsObject(Seq("existingField"-> JsTrue))) == expected)
    }

    it("Can create JsObject from nested fields") {

      val expected = Json.parse("""
            {
              "one" : "value1",
              "two" : "value2",
              "three" : {
                "one": "value3-1",
                "two" : {
                  "one": "value3-2-1"
                }
              }
            } """)

      assert(FlattenModelFields.flattenFields(nested) == expected)
    }

  }

}

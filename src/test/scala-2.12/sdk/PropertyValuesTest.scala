package sdk

import org.scalatest.FunSpec
import play.api.libs.json._
import PropertyValuesConversions._

class PropertyValuesTest extends FunSpec {

  describe("Property Value for ") {

    def compare[P <: PropertyValue](propertyValues: P, jsValue: JsValue) = {
      assert(propertyValues.asJson == jsValue)
      assert(propertyValues == jsValue.toScala)
      assert(propertyValues == jsValue)
      assert(jsValue != propertyValues)
    }

    it("String") {
      compare[StringProperty](StringProperty("Hello World"), JsString("Hello World"))
    }

    it("Number") {
      compare[NumberProperty](NumberProperty(5), JsNumber(5))
    }

    it("Bool") {
      compare[BoolProperty](BoolProperty(true), JsBoolean(true))
    }

    it("Array") {
      compare[ArrayProperty](ArrayProperty(Vector(StringProperty("One"), NumberProperty(2))), JsArray(Seq(JsString("One"), JsNumber(2))))
    }

    it("Object") {
      compare[ObjectProperty](ObjectProperty(Map(
        "hello"-> StringProperty("World"),
        "empty"-> ObjectProperty(Map()),
        "me"-> ArrayProperty(Vector(StringProperty("One"), NumberProperty(2)))
      )
      ), JsObject(Seq(
          "hello"-> JsString("World"),
          "empty"-> JsObject.empty,
          "me"-> JsArray(Seq(JsString("One"), JsNumber(2)))
        )
      ))
    }


  }

}

package com.seamless.oas

import com.seamless.oas.JsonSchemaType.{EitherType, SingleType}
import org.scalatest.FunSpec
import play.api.libs.json.{JsObject, Json}

class JsonSchemaTypeSpec extends FunSpec {

  val string = Json.parse("""{"type": "string"}""").as[JsObject]
  val number = Json.parse("""{"type": "number"}""").as[JsObject]
  val oneOf = Json.parse("""{"oneOf": [{"type": "string"}, {"type": "number"}]  }""").as[JsObject]

  it("recognizes single type constraints") {
    assert(JsonSchemaType.fromDefinition(string) == SingleType("string"))
  }

  it("recognizes oneOf constraints") {
    val oneOfParsed = JsonSchemaType.fromDefinition(oneOf)
    assert(oneOfParsed == EitherType(Vector(
      SingleType("string"),
      SingleType("number")
    )))
  }

  //missing refs

  //anyOf

  //allOf (skipping)

}

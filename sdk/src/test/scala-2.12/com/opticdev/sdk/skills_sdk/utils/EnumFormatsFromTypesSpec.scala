package com.opticdev.sdk.skills_sdk.utils

import org.scalatest.FunSpec
import play.api.libs.json.{Format, JsString, Json}

class EnumFormatsFromTypesSpec extends FunSpec {

  sealed trait Test
  case object TestA extends Test
  case object TestB extends Test
  case object TestC extends Test
  //not specified
  case object TestD extends Test

  def fixture = new {
    implicit val testInstance: Format[Test] = EnumFormatsFromTypes.newFormats[Test](Map(
      "A" -> TestA,
      "B" -> TestB,
      "C" -> TestC
    ))
  }

  it("can create a formats") {
    fixture
  }

  it("can serialize a known case") {
    val f = fixture
    import f._
    assert(Json.toJson[Test](TestA) == JsString("A"))
  }

  it("can deserialize a known case") {
    val f = fixture
    import f._
    assert(Json.fromJson[Test](JsString("A")).get == TestA)
  }

  it("will fail when serializing an unknown case") {
    val f = fixture
    import f._
    assertThrows[NoSuchElementException] {
      Json.toJson[Test](TestD)
    }
  }

  it("will fail when deserializing an unknown case") {
    val f = fixture
    import f._
    assertThrows[NoSuchElementException] {
      Json.fromJson[Test](JsString("D"))
    }
  }

}

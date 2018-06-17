package com.opticdev.core.trainer

import com.opticdev.core.Fixture.TestBase
import com.opticdev.parsers.graph.AstType
import com.opticdev.sdk.descriptions.CodeComponent
import com.opticdev.sdk.descriptions.enums.{ObjectLiteral, Token}
import com.opticdev.sdk.descriptions.finders.NodeFinder
import play.api.libs.json.{JsBoolean, JsObject, JsString, Json}

class TrainerSpec extends TestBase {

  val importTrainerValidExample = Trainer("", "es7", "const definedAs = require('pathto')", JsObject(Seq(
    "definedAs" -> JsString("definedAs"),
    "pathto" -> JsString("pathto"),
  )))

  val importTrainerExampleWithExtraProp = Trainer("", "es7", "const definedAs = require('pathto')", JsObject(Seq(
    "definedAs" -> JsString("definedAs"),
    "pathto" -> JsString("pathto"),
    "otherProp" -> JsBoolean(true),
  )))

  val objectLiteralTrainerValidExample = Trainer("", "es7", """const initialState = {key: 'value', token: thisToken}""", JsObject(Seq(
    "object" -> Json.parse("""{"key":"value","token":{"_valueFormat":"token","value":"thisToken"}}"""),
  )))

  it("can extract token candidates") {
    val tokenCandidates = importTrainerValidExample.extractTokensCandidates

    assert(tokenCandidates == Set(
      ValueCandidate(JsString("definedAs"), "...const <b>definedAs</b> = require...", CodeComponent(List("definedAs"), NodeFinder(AstType("Identifier", "es7"), Range(6, 15)), Token))
    ))
  }

  it("can extract literal candidates") {
    val literalCandidates = importTrainerValidExample.extractLiteralCandidates

    assert(literalCandidates == Set(
      ValueCandidate(JsString("pathto"), "...= require(<b>'pathto'</b>)...", CodeComponent(List("pathto"), NodeFinder(AstType("Literal", "es7"), Range(26, 34)), Token))
    ))
  }

  it("can extract object literal candidates") {
    val objectLiteralCandidates = objectLiteralTrainerValidExample.extractObjectLiteralCandidates

    assert(objectLiteralCandidates == Set(
      ValueCandidate(Json.parse("""{"key":"value","token":{"_valueFormat":"token","value":"thisToken"},"_order":["key","token"]}"""),
        "...alState = <b>{key: 'value', token: thisToken}</b>...",
        CodeComponent(List("object"),
          NodeFinder(AstType("ObjectExpression", "es7"), Range(21, 53)), ObjectLiteral))
    ))

  }

  it("can return all candidates and failures") {
    val allCandidates = importTrainerExampleWithExtraProp.returnAllCandidates
    assert(allCandidates.isSuccess)
    assert(allCandidates.get.candidates.size == 2)
    assert(allCandidates.get.keysNotFound == Seq("otherProp"))
    assert(allCandidates.get.initialValues.head == (Seq("otherProp"), JsBoolean(true)))
  }

  describe("bolding") {
    it("works in the middle of a string") {
      assert(importTrainerValidExample.generatePreview(Range(18,25)) == "...finedAs = <b>require</b>('pathto')...")
    }

    it("works at the start of a string") {
      assert(importTrainerValidExample.generatePreview(Range(0,5)) == "...<b>const</b> definedAs...")
    }

    it("works at the end of a string") {
      assert(importTrainerValidExample.generatePreview(Range(27,33)) == "... require('<b>pathto</b>')...")
    }
  }

}

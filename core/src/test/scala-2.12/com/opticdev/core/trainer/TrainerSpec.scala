package com.opticdev.core.trainer

import com.opticdev.core.Fixture.TestBase
import com.opticdev.parsers.graph.AstType
import com.opticdev.sdk.opticmarkdown2.OMRange
import com.opticdev.sdk.opticmarkdown2.lens._
import play.api.libs.json._

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

  val variableValidExample = Trainer("", "es7", """const initialState = [variableA, variableA, variableA]""", JsObject(Seq()))

  val containerExample = Trainer("", "es7",
    """
      |app.get('url', (req, res) => {
      | if (req) {
      |   //:go
      | } else {
      |   //:fail
      | }
      |})
    """.stripMargin,
    JsObject(Seq(
      "method" -> JsString("get"),
      "url" -> JsString("url"),
  )))

  it("can extract token candidates") {
    val tokenCandidates = importTrainerValidExample.extractTokensCandidates

    assert(tokenCandidates == Set(
      ValueCandidate(JsString("definedAs"), "...const <b>definedAs</b> = require...", OMComponentWithPropertyPath(Seq("definedAs"), OMLensCodeComponent(Token, OMLensNodeFinder("Identifier", OMRange(6, 15)))), JsObject(Seq("type" -> JsString("string")))
    )))
  }

  it("can extract literal candidates") {
    val literalCandidates = importTrainerValidExample.extractLiteralCandidates

    assert(literalCandidates == Set(
      ValueCandidate(JsString("pathto"), "...= require(<b>'pathto'</b>)...", OMComponentWithPropertyPath(Seq("pathto"), OMLensCodeComponent(Literal, OMLensNodeFinder("Literal", OMRange(26, 34)))), JsObject(Seq("type" -> JsString("string"))))
    ))
  }

  it("can extract object literal candidates") {
    val objectLiteralCandidates = objectLiteralTrainerValidExample.extractObjectLiteralCandidates

    assert(objectLiteralCandidates == Set(
      ValueCandidate(Json.parse("""{"key":"value","token":{"_valueFormat":"token","value":"thisToken"}}"""),
        "...alState = <b>{key: 'value', token: thisToken}</b>...",
        OMComponentWithPropertyPath(Seq("object"), OMLensCodeComponent(ObjectLiteral, OMLensNodeFinder("ObjectExpression", OMRange(21, 53)))),
        JsObject(Seq("type" -> JsObject.empty)))))

  }

  it("can return all candidates and failures") {
    val allCandidates = importTrainerExampleWithExtraProp.returnAllCandidates
    assert(allCandidates.isSuccess)
    assert(allCandidates.get.candidates.size == 2)
    assert(allCandidates.get.keysNotFound == Seq("otherProp"))
    assert(allCandidates.get.initialValue.fieldSet.head == ("otherProp", JsBoolean(true)))
    assert(allCandidates.get.containerCandidates.isEmpty)
    assert(allCandidates.get.variableCandidates.size == 2)
  }

  it("can return all possible components") {
    val containers = containerExample.extractContainersCandidates
    assert(containers.map(_.name) == Seq("go", "fail"))
  }

  it("can return all possible variables") {
    val variables = variableValidExample.extractVariableCandidates
    assert(variables.map(_.name) == Seq("variableA", "initialState"))
    assert(variables.map(_.occurrences.size) == Seq(3, 1))
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

    it("will escape HTML") {
      val escapedPreview = Trainer("", "es7", "const definedAs = <div><b></b><abc></abc></div>", JsObject.empty).generatePreview(Range(18, 30))
      assert(escapedPreview == "...finedAs = <b>&lt;div&gt;&lt;b&gt;&lt;/b&gt;</b>&lt;abc&gt;&lt;/abc...")
    }
  }

  describe("Works after container mutations") {

    val snippet =
      """
        |request.get({}, (response)=> {
        |   if (response) {
        |       //:success
        |   } else {
        |       //:failure
        |   }
        |}, 500)
      """.stripMargin

    val withcontainerMutations = Trainer("", "es7", snippet, JsObject(Seq(
      "method" -> JsString("get"),
      "tiemout" -> JsNumber(500)
    )))

    it("can still create a valid candidate even after comments are removed") {
      val result = withcontainerMutations.returnAllCandidates

      assert(result.get.containerCandidates(0).previewString == "...response) <b>{\n\n   }</b> else {\n\n ...")
      assert(result.get.containerCandidates(1).previewString == "...   } else <b>{\n\n   }</b>\n}, 500)\n ...")

    }


  }

}

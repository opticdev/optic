package com.opticdev.core.trainer

import com.opticdev.core.Fixture.TestBase
import com.opticdev.parsers.graph.AstType
import com.opticdev.sdk.opticmarkdown2.OMRange
import com.opticdev.sdk.opticmarkdown2.lens._
import play.api.libs.json._

class TrainerSpec extends TestBase {

  val importTrainerValidExample = Trainer("es7", "const definedAs = require('pathto')")

  val importTrainerExampleWithExtraProp = Trainer("es7", "const definedAs = require('pathto')")

  val objectLiteralTrainerValidExample = Trainer("es7", """const initialState = {key: 'value', token: thisToken}""")

  val variableValidExample = Trainer("es7", """const initialState = [variableA, variableA, variableA]""")

  val containerExample = Trainer("es7",
    """
      |app.get('url', (req, res) => {
      | if (req) {
      |   //:go
      | } else {
      |   //:fail
      | }
      |})
    """.stripMargin)

  it("can extract token candidates") {
    val tokenCandidates = importTrainerValidExample.extractTokensCandidates

    assert(tokenCandidates.size == 2)
  }

  it("can extract literal candidates") {
    val literalCandidates = importTrainerValidExample.extractLiteralCandidates

    assert(literalCandidates.size == 1)
  }

  it("can extract object literal candidates") {
    val objectLiteralCandidates = objectLiteralTrainerValidExample.extractObjectLiteralCandidates

    assert(objectLiteralCandidates.size == 1)

  }

  it("can return all candidates") {
    val allCandidates = importTrainerExampleWithExtraProp.returnAllCandidates
    assert(allCandidates.isSuccess)
    assert(allCandidates.get.candidates.size == 3)
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
      val escapedPreview = Trainer("es7", "const definedAs = <div><b></b><abc></abc></div>").generatePreview(Range(18, 30))
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

    val withcontainerMutations = Trainer("es7", snippet)

    it("can still create a valid candidate even after comments are removed") {
      val result = withcontainerMutations.returnAllCandidates

      assert(result.get.containerCandidates(0).previewString == "...response) <b>{\n\n   }</b> else {\n\n ...")
      assert(result.get.containerCandidates(1).previewString == "...   } else <b>{\n\n   }</b>\n}, 500)\n ...")

    }


  }

}

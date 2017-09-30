package sourcegear.mutate

import Fixture.TestBase
import Fixture.compilerUtils.GearUtils
import better.files.File
import com.opticdev.core.sdk.descriptions.CodeComponent
import com.opticdev.core.sdk.descriptions.enums.ComponentEnums.Literal
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.graph.enums.AstPropertyRelationship
import com.opticdev.core.sourcegear.mutate.MutationSteps._
import com.opticdev.core.sourceparsers.SourceParserManager
import com.opticdev.parsers.ParserBase
import org.scalatest.FunSpec
import play.api.libs.json.{JsObject, JsString}

class MutationStepsTest extends TestBase with GearUtils {

  override val sourceGear = new SourceGear {
    override val parsers: Set[ParserBase] = SourceParserManager.getInstalledParsers
  }

  val testFilePath = getCurrentDirectory + "/src/test/resources/example_source/ImportSource.js"

  val importResults = {
    val importGear = gearFromDescription("src/test/resources/sdkDescriptions/ImportExample.json")
    sourceGear.gearSet.addGear(importGear)
    sourceGear.parseFile(File(testFilePath))
  }

  val helloWorldImport = importResults.get.modelNodes.find(i=> (i.value \ "pathTo").get == JsString("world")).get
  val resolved = helloWorldImport.resolve

  implicit val fileContents = File(testFilePath).contentAsString

  describe("collect changes") {
    it("can collect changes") {
      val changes = collectChanges(resolved, JsObject(Seq("definedAs" -> JsString("hello"), "pathTo" -> JsString("CHANGED"))))
      assert(changes.size == 1)
      assert(changes.head.component.propertyPath == "pathTo")
      assert(changes.head.component.asInstanceOf[CodeComponent].codeType == Literal)
    }

    it("doesn't calculate a diff for same properties") {
      val changes = collectChanges(resolved, resolved.value)
      assert(changes.isEmpty)
    }

  }

  describe("handle changes") {
    val changes = collectChanges(resolved, JsObject(Seq("definedAs" -> JsString("DIFFERENT"), "pathTo" -> JsString("CHANGED"))))
    it("generates AST changes") {
      val astChanges = handleChanges(changes)
      assert(astChanges.find(_.mapping.relationship == AstPropertyRelationship.Literal).get.replacementString.get == "'CHANGED'")
      assert(astChanges.find(_.mapping.relationship == AstPropertyRelationship.Token).get.replacementString.get == "DIFFERENT")
    }

  }

  describe("combine changes") {
    it("Combines changes in reverse to avoid range conflicts") {
      val changes = collectChanges(resolved, JsObject(Seq("definedAs" -> JsString("DIFFERENT"), "pathTo" -> JsString("CHANGED"))))
      val astChanges = handleChanges(changes)
      assert(combineChanges(astChanges).toString == "let DIFFERENT = require('CHANGED')\n\nfunction test () {\n    let nextOne = require(\"PIZZA!\")\n}")
    }
  }

}

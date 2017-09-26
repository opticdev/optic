package sourcegear.graph

import Fixture.TestBase
import Fixture.compilerUtils.GearUtils
import better.files.File
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.graph.enums.AstPropertyRelationship
import com.opticdev.core.sourcegear.graph.model.{LinkedModelNode, Path}
import com.opticdev.core.sourceparsers.SourceParserManager
import com.opticdev.parsers.ParserBase
import org.scalatest.FunSpec
import play.api.libs.json.{JsObject, JsString}

class ModelNodeTest extends TestBase with GearUtils {

  describe("Model node test") {

    val sourceGear = new SourceGear {
      override val parsers: Set[ParserBase] = SourceParserManager.getInstalledParsers
    }

    val importResults = {
      val importGear = gearFromDescription("src/test/resources/sdkDescriptions/ImportExample.json")
      sourceGear.gearSet.addGear(importGear)
      val testFilePath = getCurrentDirectory + "/src/test/resources/example_source/ImportSource.js"
      sourceGear.parseFile(File(testFilePath))
    }

    it("can resolve when flat") {

      implicit val astGraph = importResults.get.astGraph

      val helloWorldImport = importResults.get.modelNodes.find(i=> (i.value \ "pathTo").get == JsString("world")).get
      val resolved = helloWorldImport.resolve
      val resolvedMapping = resolved.mapping

      assert(resolvedMapping.size == 2)
      assert(resolvedMapping.get(Path("definedAs")).get.relationship == AstPropertyRelationship.Token)
      assert(resolvedMapping.get(Path("pathTo")).get.relationship == AstPropertyRelationship.Literal)

    }

    describe("Mutation") {

      val helloWorldImport = importResults.get.modelNodes.find(i=> (i.value \ "pathTo").get == JsString("world")).get
      val resolved = helloWorldImport.resolve

      it("Can mutate a token") {
        import com.opticdev.core.sourcegear.mutate.MutationImplicits._
        resolved.update(JsObject(Seq("definedAs" -> JsString("goodbye"), "pathTo" -> JsString("local"))))

      }

    }

  }

}

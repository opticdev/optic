package sourcegear.accumulators

import Fixture.{AkkaTestFixture, TestBase}
import Fixture.compilerUtils.GearUtils
import better.files.File
import play.api.libs.json.Json
import com.opticdev.core.sdk.SdkDescription
import com.opticdev.core.sdk.descriptions.SchemaId
import com.opticdev.core.sourcegear.SGContext
import com.opticdev.core.sourcegear.project.Project
import com.opticdev.parsers.SourceParserManager

import scala.io.Source

class FileAccumulatorTest extends AkkaTestFixture("FileAccumulatorTest") with GearUtils {


  implicit val project = new Project("test", File(getCurrentDirectory + "/src/test/resources/example_source/"), sourceGear)

  describe("File Accumulator") {

    it("enables map schemas to work") {

      val sourceGear = sourceGearFromDescription("src/test/resources/sdkDescriptions/RequestSdkDescription.json")
      val result = sourceGear.parseFile(File("src/test/resources/example_source/ExampleExpress.js"))

      implicit val sourceGearContext = SGContext(sourceGear.fileAccumulator, result.get.astGraph, SourceParserManager.installedParsers.head, null)

      assert(result.isSuccess && result.get.modelNodes.size == 4)

      val expected = Json.parse("""{
        	"parameters": [{
        		"name": "firstLevel",
        		"in": "query"
        	}, {
        		"name": "nested",
        		"in": "body"
        	}],
        	"url": "url",
        	"method": "get"
        }""")

      val modelNode = result.get.modelNodes.find(_.schemaId == SchemaId("js-example-route^1.0.0")).get
      assert(modelNode.expandedValue == expected)

    }


  }


}

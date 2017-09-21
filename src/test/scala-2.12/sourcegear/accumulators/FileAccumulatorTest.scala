package sourcegear.accumulators

import Fixture.TestBase
import Fixture.compilerUtils.GearUtils
import better.files.File
import play.api.libs.json.Json
import com.opticdev.core.sdk.SdkDescription
import com.opticdev.core.sdk.descriptions.SchemaId

import scala.io.Source

class FileAccumulatorTest extends TestBase with GearUtils {

  describe("File Accumulator") {

    it("enables map schemas to work") {
      val sourceGear = sourceGearFromDescription("src/test/resources/sdkDescriptions/RequestSdkDescription.json")
      val result = sourceGear.parseFile(File("src/test/resources/example_source/ExampleExpress.js"))

      assert(result.size == 4)

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

      assert(result.find(_.modelNode.schemaId == SchemaId("js-example-route^1.0.0")).get.modelNode
        .value == expected)

    }


  }


}

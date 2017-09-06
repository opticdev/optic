package sourcegear.accumulators

import Fixture.TestBase
import Fixture.compilerUtils.GearUtils
import better.files.File
import play.api.libs.json.Json
import sdk.SdkDescription

import scala.io.Source

class FileAccumulatorTest extends TestBase with GearUtils {

  describe("File Accumulator") {

    it("enables map schemas to work") {
      val sourceGear = sourceGearFromDescription("src/test/resources/sdkDescriptions/RequestSdkDescription.json")
      val result = sourceGear.parseFile(File("src/test/resources/example_source/ExampleExpress.js"))



//      assert(result.size == 2)


    }


  }


}

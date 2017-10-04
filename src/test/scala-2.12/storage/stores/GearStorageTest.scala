package storage.stores

import Fixture.TestBase
import Fixture.compilerUtils.GearUtils
import better.files.File
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.storage.stores.{GearStorage, ParserStorage}
import com.opticdev.parsers.{ParserBase, SourceParserManager}
import org.scalatest.FunSpec

class GearStorageTest extends TestBase with GearUtils {

  val testFilePath = getCurrentDirectory + "/src/test/resources/example_source/ImportSource.js"

  val importGear = gearFromDescription("src/test/resources/sdkDescriptions/ImportExample.json")


  describe("Gear Storage") {

    it("can write to storage") {
      assert(GearStorage.writeToStorage(importGear).exists)
    }

    it("can read back in") {
      assert(GearStorage.loadFromStorage("Using Require").get == importGear)
    }

  }

}

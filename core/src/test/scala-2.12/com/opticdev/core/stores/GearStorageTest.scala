package com.opticdev.core.stores

import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.Fixture.compilerUtils.GearUtils
import com.opticdev.core.storage.stores.GearStorage

class GearStorageTest extends TestBase with GearUtils {

  val testFilePath = getCurrentDirectory + "/test-examples/resources/example_source/ImportSource.js"

  val importGear = gearFromDescription("test-examples/resources/sdkDescriptions/ImportExample.json")


  describe("Gear Storage") {

    it("can write to storage") {
      assert(GearStorage.writeToStorage(importGear).exists)
    }

    it("can read back in") {
      assert(GearStorage.loadFromStorage("Using Require").get == importGear)
    }

  }

}

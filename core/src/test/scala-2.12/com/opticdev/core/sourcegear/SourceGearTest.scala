package com.opticdev.core.sourcegear

import better.files.File
import com.opticdev.core.Fixture.AkkaTestFixture
import com.opticdev.core.Fixture.compilerUtils.GearUtils
import com.opticdev.core.sourcegear.project.Project
import com.opticdev.parsers.{ParserBase, SourceParserManager}

/*
//@todo INCOMPLETE TESTS. NEED TO DO SOME SERIOUS WORK ON THE SUITE
 */

class SourceGearTest extends AkkaTestFixture("SourceGearTest") with GearUtils {

  describe("SourceGear") {

    val sourceGear = new SourceGear {
      override val parsers: Set[ParserBase] = SourceParserManager.installedParsers
    }

    implicit val project = new Project("test", File(getCurrentDirectory + "/test-examples/resources/example_source/"), sourceGear)

    it("Finds matches in a test file.") {

      val importGear = gearFromDescription("test-examples/resources/sdkDescriptions/ImportExample.json")

      sourceGear.gearSet.addGear(importGear)

      val testFilePath = getCurrentDirectory + "/test-examples/resources/example_source/ImportSource.js"
      val results = sourceGear.parseFile(File(testFilePath))

      assert(results.get.modelNodes.size == 2)

    }

  }

}

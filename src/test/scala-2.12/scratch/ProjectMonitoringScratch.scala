package scratch

import Fixture.{PreTest, TestBase}
import Fixture.compilerUtils.GearUtils
import better.files.File
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.actors.CurrentGraph
import com.opticdev.core.sourcegear.project.Project
import com.opticdev.core.sourceparsers.SourceParserManager
import com.opticdev.parsers.ParserBase

object ProjectMonitoringScratch extends GearUtils with TestBase {

  def main(args: Array[String]) {

    implicit val sourceGear = new SourceGear {
      override val parsers: Set[ParserBase] = SourceParserManager.getInstalledParsers
    }

    val importGear = gearFromDescription("src/test/resources/sdkDescriptions/ImportExample.json")
    sourceGear.gearSet.addGear(importGear)

    val project = new Project("test", File(getCurrentDirectory + "/src/test/resources/tmp/test_project/"), sourceGear)

    project.watch

  }

}

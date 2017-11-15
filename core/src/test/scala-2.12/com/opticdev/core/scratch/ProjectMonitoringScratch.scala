package com.opticdev.core.scratch

import java.util.Scanner

import com.opticdev.core.actorSystem
import better.files.File
import com.opticdev.core.sourcegear.{SGContext, SourceGear}
import com.opticdev.core.sourcegear.actors.{ActorCluster, CurrentGraph}
import com.opticdev.core.sourcegear.project.Project
import com.opticdev.parsers.SourceParserManager
import com.opticdev.parsers.ParserBase
import akka.event.Logging
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.Fixture.compilerUtils.GearUtils

object ProjectMonitoringScratch extends GearUtils with TestBase {

  def main(args: Array[String]) {

    implicit val logToCli = true
    implicit val actorCluster = new ActorCluster(actorSystem)

    implicit val sourceGear = new SourceGear {
      override val parsers: Set[ParserBase] = SourceParserManager.installedParsers
    }


    val importGear = gearFromDescription("test-examples/resources/sdkDescriptions/ImportExample.json")
    sourceGear.gearSet.addGear(importGear)

    val requestGears = gearsFromDescription("test-examples/resources/sdkDescriptions/RequestSdkDescription.json")
    sourceGear.gearSet.addGears(requestGears:_*)

    val project = new Project("test", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), sourceGear)

    project.watch

//    val scan = new Scanner(System.in);
//
//    while(true) {
//      val i = scan.next();
//      println(i)
//    }

  }

}

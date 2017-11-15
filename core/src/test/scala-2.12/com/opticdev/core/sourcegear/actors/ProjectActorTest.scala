package com.opticdev.sourcegear.actors

import better.files.File
import com.opticdev.core.Fixture.AkkaTestFixture
import com.opticdev.core.Fixture.compilerUtils.GearUtils
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.actors.{CurrentGraph, FileCreated, FileDeleted}
import com.opticdev.core.sourcegear.graph.ProjectGraphWrapper
import com.opticdev.core.sourcegear.project.Project
import com.opticdev.parsers.{ParserBase, SourceParserManager}

class ProjectActorTest extends AkkaTestFixture("ProjectActorTest") with GearUtils {

  describe("Project Actor") {

    resetScratch

    implicit val sourceGear = new SourceGear {
      override val parsers: Set[ParserBase] = SourceParserManager.installedParsers
    }

    val importGear = gearFromDescription("test-examples/resources/sdkDescriptions/ImportExample.json")
    sourceGear.gearSet.addGear(importGear)

    val project = new Project("test", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), sourceGear)

    it("can handle a file creation") {
      project.projectActor ! FileCreated(File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/app.js"), project)
      expectMsgPF() {
        case i: ProjectGraphWrapper => {
          assert(i.projectGraph.size == 3)
        }
      }
    }

    it("can handle a file deletion") {
      project.projectActor ! FileDeleted(File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/app.js"), project)
      expectMsgPF() {
        case i: ProjectGraphWrapper => {
          assert(i.projectGraph.isEmpty)
        }
      }
    }

    it("can return the graph") {
      project.projectActor ! CurrentGraph
      expectMsgAllClassOf[ProjectGraphWrapper]()
    }

  }

}

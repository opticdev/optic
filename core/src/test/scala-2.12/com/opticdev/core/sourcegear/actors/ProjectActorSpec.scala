package com.opticdev.sourcegear.actors

import better.files.File
import com.opticdev.core.Fixture.AkkaTestFixture
import com.opticdev.core.Fixture.compilerUtils.GearUtils
import com.opticdev.core.sourcegear.{LensSet, SourceGear}
import com.opticdev.core.sourcegear.actors.{CurrentGraph, FileCreated, FileDeleted, ProjectActorSyncAccess}
import com.opticdev.core.sourcegear.graph.ProjectGraphWrapper
import com.opticdev.core.sourcegear.project.{Project, StaticSGProject}
import com.opticdev.parsers.{ParserBase, SourceParserManager}
import scala.concurrent.ExecutionContext.Implicits.global

class ProjectActorSpec extends AkkaTestFixture("ProjectActorTest") with GearUtils {

    override def beforeAll() = {
      resetScratch
      super.beforeAll
    }

    override implicit val sourceGear = new SourceGear {
      override val parsers: Set[ParserBase] = SourceParserManager.installedParsers
      override val lensSet = new LensSet()
      override val schemas = Set()
      override val transformations = Set()
    }

    val importGear = gearFromDescription("test-examples/resources/example_packages/optic:ImportExample@0.1.0.json")
    sourceGear.lensSet.addGear(importGear)

    val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), sourceGear)

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

    it("can clear the graph synchronously") {
      ProjectActorSyncAccess.clearGraph(project.projectActor)
        .onComplete(i=> assert(i.get.projectGraph.isEmpty))
    }


}

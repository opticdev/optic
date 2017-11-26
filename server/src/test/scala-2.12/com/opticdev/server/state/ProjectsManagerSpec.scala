package com.opticdev.server.state

import better.files.File
import com.opticdev.core.Fixture.AkkaTestFixture
import com.opticdev.core.sourcegear.project.Project
import com.opticdev.server.storage.ServerStorage
import org.scalatest.FunSpec

class ProjectsManagerSpec extends AkkaTestFixture("ProjectsManagerSpec") {

  def fixture(obj: ServerStorage = ServerStorage()) = new ProjectsManager() {
    override def storage: ServerStorage = obj
  }

  it("starts empty") {
    val f = fixture(ServerStorage())
    assert(f.allProjects.isEmpty)
  }

  describe("project lookup") {

    describe("by name") {

      it("fails when project does not exist") {
        val f = fixture()
        assert(f.lookup("fake").isFailure)
      }

      it("works when project exists in known project") {
        val f = fixture(ServerStorage(Map("test" -> "test-examples/resources/tmp/test_project")))
        assert(f.lookup("test").isSuccess)
      }

      it("works when project is already in memory") {
        val f = fixture()
        f.loadProject("test", File("test-examples/resources/tmp/test_project"))
        assert(f.lookup("test").isSuccess)
      }

    }

  }

  describe("Project loader") {

    it("will not load two projects with the same name") {
      val f = fixture()
      assert(f.loadProject("test", File("test-examples/resources/tmp/test_project")).isSuccess)
      assert(f.loadProject("test", File("test-examples/resources/tmp/test_project")).isFailure)
    }

    it("Handles new projects FILO") {
      val f = fixture()
      (0 to f.MAX_PROJECTS * 2).foreach(i=> {
        f.loadProject(i.toString, File("test-examples/resources/tmp/test_project")).isSuccess

        val projectNamesInMemory = f.allProjects.map(_.name.toInt)
        val expected = (i-f.MAX_PROJECTS+1 to i).toVector.filterNot(_ < 0)
        assert(projectNamesInMemory == expected)
        assert(f.allProjects.size <= f.MAX_PROJECTS)
      })
    }

  }

  //@todo implement tests
  describe("Project unloader") {
    it("can save project state to cache") {}
    it("can stop watching projects") {}
  }

}

package sourcegear.project

import Fixture.TestBase
import better.files.File
import com.opticdev.core.sourcegear.project.Project
import org.scalatest.FunSpec

class ProjectTest extends TestBase {
  describe("Project test") {

    it("can list all files recursively") {
      val project = new Project("test", File(getCurrentDirectory + "/src/test/resources/tmp/test_project"))
//      println(project.watchedFiles)
    }



  }
}

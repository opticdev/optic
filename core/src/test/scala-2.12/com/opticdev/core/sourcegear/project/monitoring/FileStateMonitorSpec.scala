package com.opticdev.core.sourcegear.project.monitoring

import better.files.File
import com.opticdev.core.Fixture.TestBase
import org.scalatest.FunSpec

class FilesStateSpec extends TestBase {

  def fixture = new {
    val fileMonitor = new FileStateMonitor
  }

  val testFile = File("test-examples/resources/tmp/test_project/nested/firstFile.js")

  it("will get contents on disk by default") {
    val f = fixture
    val contentsTry = f.fileMonitor.contentsForFile(testFile)
    assert(contentsTry.get == "let me = \"you\"")
  }

  it("can stage unsaved changes from editor") {
    val f = fixture
    f.fileMonitor.stageContents(testFile, "let hello = \"world\"")
    assert(f.fileMonitor.contentsForFile(testFile).get == "let hello = \"world\"")
  }

  it("can mark a file as updated so it reads from disk") {
    val f = fixture
    f.fileMonitor.stageContents(testFile, "let hello = \"world\"")
    f.fileMonitor.markUpdated(testFile)
    assert(f.fileMonitor.contentsForFile(testFile).get == "let me = \"you\"")
  }

  describe("nested file monitors") {

    it("will get a parent file monitor's state before reading from disk") {
      val fs1 =  new FileStateMonitor
      val fs2 =  new FileStateMonitor(fs1)

      fs1.stageContents(testFile, "let fun = \"time\"")

      assert(fs2.contentsForFile(testFile).get == "let fun = \"time\"")

    }

    it("will fallback to files if no file monitor has staged contents") {
      val fs1 =  new FileStateMonitor
      val fs2 =  new FileStateMonitor(fs1)
      assert(fs2.contentsForFile(testFile).get == "let me = \"you\"")
    }

    it("marking something as updated will ripple to all state monitors") {
      val fs1 =  new FileStateMonitor
      val fs2 =  new FileStateMonitor(fs1)

      fs1.stageContents(testFile, "let fun = \"time\"")

      fs2.markUpdated(testFile)

      assert(fs1.allStaged.isEmpty)
      assert(fs2.allStaged.isEmpty)

    }

  }

}

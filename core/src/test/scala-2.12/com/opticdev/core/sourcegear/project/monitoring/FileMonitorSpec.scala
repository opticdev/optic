package com.opticdev.core.sourcegear.project.monitoring

import better.files.File
import org.scalatest.FunSpec

class FilesStateSpec extends FunSpec {

  def fixture = new {
    val fileMonitor = new FilesState((f)=> true)
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

}

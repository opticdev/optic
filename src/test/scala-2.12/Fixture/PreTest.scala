package Fixture

import org.apache.commons.io.FileUtils

object PreTest {
  def run: Unit = {

    resetScratch

  }

  def resetScratch = {
    val cd = new java.io.File(".").getCanonicalPath
    val tmp = new java.io.File(cd+"/src/test/resources/tmp")
    if (tmp.exists()) {
      FileUtils.deleteDirectory(tmp)
    }
    tmp.mkdir()
    FileUtils.copyDirectory(new java.io.File(cd+"/src/test/resources"), tmp)
  }

}

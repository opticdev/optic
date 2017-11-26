package com.opticdev.core.Fixture

import org.apache.commons.io.FileUtils

object PostTest {
  def run: Unit = {
    clearScratch
  }

  def clearScratch = {
    val cd = new java.io.File(".").getCanonicalPath
    val tmp = new java.io.File(cd+"/test-examples/resources/tmp")
    FileUtils.deleteDirectory(tmp)
  }
}

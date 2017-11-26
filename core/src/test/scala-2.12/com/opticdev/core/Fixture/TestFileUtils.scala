package com.opticdev.core.Fixture

trait TestFileUtils {
  def getCurrentDirectory = new java.io.File(".").getCanonicalPath
}

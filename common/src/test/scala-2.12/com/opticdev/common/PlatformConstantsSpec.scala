package com.opticdev.common

import better.files.File
import com.opticdev.common.storage.{Mac, OS}
import org.apache.commons.lang3.SystemUtils
import org.scalatest.FunSpec

class PlatformConstantsSpec extends FunSpec {

  def platformTests(expectedPlatform: OS, expectedDataDirectory: File): Unit = {
    it("detects proper platform") {
      assert(PlatformConstants.platform == expectedPlatform)
    }

    it("detects proper data directory") {
      assert(PlatformConstants.dataDirectory == expectedDataDirectory)
    }
  }

  if (SystemUtils.IS_OS_MAC_OSX) {
    platformTests(Mac, File(SystemUtils.USER_HOME+"/Library/Application Support/Optic"))
  }

  it("It finds valid node paths") {
    println(PlatformConstants.nodePath)
  }

}

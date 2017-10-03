package storage

import better.files.File
import com.opticdev.core.storage.{Mac, OS, PlatformConstants}
import org.scalatest.FunSpec
import org.apache.commons.lang3.SystemUtils

class PlatformConstantsTest extends FunSpec {

  describe("platform constants") {

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


  }

}

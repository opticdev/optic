package cli


import java.io.{FileOutputStream, PrintStream}

import com.opticdev.core.cli.CliMain
import com.sun.xml.internal.messaging.saaj.util.ByteOutputStream
import org.scalatest.FunSpec

import scala.util.Try

class CliTest extends FunSpec {

  describe("Cli") {

    def testCli(input: String) = {
      CliMain.handleArgs(input.split("\\s+"))
    }

    describe("Install description command") {
      it("will fail without a file") {
          assert(testCli("install") == "error")
      }

      it("will work with a valid file") {
        assert(testCli("install src/test/resources/sdkDescriptions/ImportExample.json").asInstanceOf[Try[Unit]]
          .isSuccess)
      }

      it("will fail with an invalid file") {
        assert(testCli("install src/test/fake/file").asInstanceOf[Try[Unit]]
          .isFailure)
      }

     }

    describe("Install parser command") {
      it("will fail without a file") {
        assert(testCli("install-parser") == "error")
      }

      it("will work with a valid file") {
        assert(testCli("install-parser "+ System.getProperty("user.home")+"/Developer/knack/parsers/javascript-lang/out/artifacts/javascript_lang_jar/javascript-lang.jar").asInstanceOf[Try[Unit]]
          .isSuccess)
      }

      it("will fail with an invalid file") {
        assert(testCli("install-parser not/real/file").asInstanceOf[Try[Unit]]
          .isFailure)
      }
    }



  }

}

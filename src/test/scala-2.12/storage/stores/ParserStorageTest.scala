package storage.stores

import better.files.File
import com.opticdev.core.storage.stores.ParserStorage
import org.scalatest.FunSpec

class ParserStorageTest extends FunSpec {
  describe("Parser Storage") {

    val parserPath = System.getProperty("user.home")+"/Developer/knack/parsers/javascript-lang/out/artifacts/javascript_lang_jar/javascript-lang.jar"

    var file : File =  null
    it("can write a parser to storage") {
      file = ParserStorage.writeToStorage(File(parserPath))
      assert(file.exists)
    }

    it("can read back in") {
      assert(ParserStorage.loadParser("Javascript_1.0").isSuccess)
    }

  }
}

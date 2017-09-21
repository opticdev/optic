import Fixture.{PostTest, PreTest, TestBase}
import org.scalatest.FunSuite
import com.opticdev.core.sourceparsers.SourceParserManager

class ParserTest extends TestBase {

  describe("Parsers") {

    it("Can have parsers cleared") {
      SourceParserManager.clearParsers
      assert(SourceParserManager.getInstalledParsers.isEmpty)
    }

    it("Can install a parser") {
      SourceParserManager.clearParsers

      val result = SourceParserManager.installParser(System.getProperty("user.home")+"/Developer/knack/parsers/javascript-lang/out/artifacts/javascript_lang_jar/javascript-lang.jar")
      assert(result.isSuccess)
      assert(SourceParserManager.getInstalledParsers.size == 1)
    }

    it("Can parse a string with installed parser") {
      val didParse = SourceParserManager.parseString("var test = 1+1", "Javascript", None)
      assert(didParse != null)
    }

  }

}

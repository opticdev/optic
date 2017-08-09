package LensCapabilities

import Fixture.{PostTest, PreTest, TestBase}
import better.files.File
import compiler.lensparser.ExampleParser
import org.scalatest.FunSuite
import sourceparsers.SourceParserManager

class LensExampleTest extends TestBase {

  describe("Lens examples") {

    describe("Regex for extraction") {
      it("Matches name") {
        assert(ExampleParser.nameRegEx.findFirstMatchIn("/* Using Require     -lang").toVector.head.toString() == "Using Require")
        assert(ExampleParser.nameRegEx.findAllMatchIn("/* ").toVector.size == 0)
      }
      it("Matches lang") {
        assert(ExampleParser.langFlagRegEx.findFirstMatchIn("/* Using Require     -lang=Javascript").toVector.head.toString() == "-lang=Javascript")
        assert(ExampleParser.langFlagRegEx.findFirstMatchIn("/* Using Require   -version=27  -lang=Javascript").toVector.head.toString() == "-lang=Javascript")
        assert(ExampleParser.langFlagRegEx.findFirstMatchIn("/* Using Require  -lang     =   Javascript").toVector.head.toString() == "-lang     =   Javascript")
      }
      it("Matches version") {
        assert(ExampleParser.versionFlagRegEx.findFirstMatchIn("/* Using Require     -version=es6").toVector.head.toString() == "-version=es6")
        assert(ExampleParser.versionFlagRegEx.findFirstMatchIn("/* Using Require  -lang=Javascript  -version=es5").toVector.head.toString() == "-version=es5")
        assert(ExampleParser.versionFlagRegEx.findFirstMatchIn("/* Using Require  -version     =   es7").toVector.head.toString() == "-version     =   es7")
      }
    }

    describe("Parsing") {
      it("Can parse example strings out of file") {

        val regexTestFile = File(getCurrentDirectory+"/src/test/resources/RegExTest.js")

        val matches = ExampleParser.findMatches(regexTestFile.contentAsString)
        assert(matches.size == 1)

        assert(matches.get("Using Require").isDefined)

        assert(matches.head._2.description.name == "Using Require")
        assert(matches.head._2.description.language == "Javascript")
        assert(matches.head._2.description.version == "es5")

      }

    }

  }

}

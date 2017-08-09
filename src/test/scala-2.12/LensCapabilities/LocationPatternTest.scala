package LensCapabilities

import Fixture.TestBase
import cognitro.parsers.GraphUtils.ParsedFile
import graph.GraphManager
import nashorn.scriptobjects.accumulators.Context._
import play.api.libs.json.{JsObject, JsString}
import sourceparsers.SourceParserManager


class LocationPatternTest extends TestBase {

  describe("Location patterns") {

    describe("Initialization") {
      it("Can be created in code") {
        LocationPattern(
          FileLocation(InPath("/src/here/there"))
        )
      }

      describe("Can be created through JS") {

        it("Works for Shared File patterns") {
          val result = LocationPattern.fromJs(JsString("[FileA]"))
          assert(result.locationRules.size == 1)
          assert(result.locationRules.head.isInstanceOf[SharedFile])
          assert(result.locationRules.head.asInstanceOf[SharedFile].name == "FileA")
        }

        it("Works for File patterns") {
          val result = LocationPattern.fromJs(JsString("/src/one/two"))
          assert(result.locationRules.size == 1)
          assert(result.locationRules.head.isInstanceOf[FileLocation])
          val asFileLocation = result.locationRules.head.asInstanceOf[FileLocation]
          assert(asFileLocation.fileRule.isInstanceOf[InPath])
          assert(asFileLocation.fileRule.asInstanceOf[InPath].filePath == "/src/one/two")
        }

      }

    }

    describe("Can Match") {

      it("Insights install") {
        installInsight("src/test/resources/insights/ImportJsInsight.js")
        installInsightFromLens("src/test/resources/examples/ExampleCall.js")
      }

      val graphManager = new GraphManager()
      implicit val graph = graphManager.getGraph
      implicit var bundleScope = new BundleScope

      val file1 = parseFile("src/test/resources/accumulators/location/file1.js").get
      val file2 = parseFile("src/test/resources/accumulators/location/file2.js").get
      val file3 = parseFile("src/test/resources/accumulators/location/file3.js").get

      graphManager.addParsedFileToGraph(file1)
      graphManager.addParsedFileToGraph(file2)
      graphManager.addParsedFileToGraph(file3)

      describe("LocationRules") {

        describe("FileLocation rule") {

          describe("In Path") {
            it("Matches files by their paths") {
              assert(FileLocation(InPath(getCurrentDirectory + "/src/test/resources/accumulators/location/file1.js")).evaluate(file1.fileNode))
              assert(FileLocation(InPath(getCurrentDirectory + "/src/test/resources/accumulators/location/file2.js")).evaluate(file2.fileNode))
              assert(FileLocation(InPath(getCurrentDirectory + "/src/test/resources/accumulators/location/file3.js")).evaluate(file3.fileNode))
            }

            it("Does not match files with incorrect paths") {
              assert(!FileLocation(InPath("PIZZA")).evaluate(file1.fileNode))
              assert(!FileLocation(InPath(getCurrentDirectory + "/src/test/resources/accumulators/location/file2.js")).evaluate(file1.fileNode))
            }
          }

          describe("In File") {
            it("Matches files with equality") {
              assert(FileLocation(InFile(file1.fileNode)).evaluate(file1.fileNode))
              assert(FileLocation(InFile(file2.fileNode)).evaluate(file2.fileNode))
              assert(FileLocation(InFile(file3.fileNode)).evaluate(file3.fileNode))
            }

            it("Does not match files without equality") {
              assert(!FileLocation(InFile(file2.fileNode)).evaluate(null))
              assert(!FileLocation(InFile(file1.fileNode)).evaluate(file3.fileNode))
            }
          }

          describe("Current File") {
            bundleScope = new BundleScope
            it("Matches same files") {
              assert(CurrentFile().evaluate(file1.fileNode))
              assert(CurrentFile().evaluate(file1.fileNode))
              assert(!CurrentFile().evaluate(file2.fileNode))
            }

            it("Does not match different files") {
              assert(!CurrentFile().evaluate(file2.fileNode))
            }

          }

        }

        describe("Shared File") {

          it("Matches the same file") {
            assert(SharedFile("A").evaluate(file1.fileNode))
            assert(SharedFile("A").evaluate(file1.fileNode))
          }

          it("Does not match different files with the same keys") {
            assert(!SharedFile("A").evaluate(file2.fileNode))
            assert(!SharedFile("A").evaluate(file3.fileNode))
          }

          it("Matches new names the first time they are passed") {
            assert(SharedFile("B").evaluate(file1.fileNode))
            assert(SharedFile("C").evaluate(file1.fileNode))
          }

        }

      }

    }

  }

}

package sdk

import org.scalatest.FunSpec
import play.api.libs.json.Json
import com.opticdev.core.sdk.descriptions._
import com.opticdev.core.sdk.descriptions.enums.FinderEnums._
import com.opticdev.core.sdk.descriptions.enums.Finders.{Finder, NodeFinder, RangeFinder, StringFinder}

class SdkFinderTest extends FunSpec {

  describe("Sdk Finder") {

    describe("Parsing") {

      describe("String") {

        describe("works when valid") {

          it("entire") {
            val validExample = """{
                                  "type": "string",
                                  "rule": "entire",
                                  "string": "definedAs",
                                  "occurrence": 0
                                  }"""

            val parsed = Finder.fromJson(Json.parse(validExample))
            assert(parsed.isInstanceOf[StringFinder])
            assert(parsed.asInstanceOf[StringFinder].rule == Entire)
            assert(parsed.asInstanceOf[StringFinder].occurrence == 0)
            assert(parsed.asInstanceOf[StringFinder].string == "definedAs")
          }

          it("starting") {
            val validExample = """{
                                  "type": "string",
                                  "rule": "starting",
                                  "string": "definedAs",
                                  "occurrence": 0
                                  }"""

            val parsed = Finder.fromJson(Json.parse(validExample))
            assert(parsed.asInstanceOf[StringFinder].rule == Starting)

          }

          it("containing") {
            val validExample = """{
                                  "type": "string",
                                  "rule": "containing",
                                  "string": "definedAs",
                                  "occurrence": 0
                                  }"""

            val parsed = Finder.fromJson(Json.parse(validExample))
            assert(parsed.asInstanceOf[StringFinder].rule == Containing)

          }

          it("fails on invalid") {
            val invalidExample = """{
                                  "type": "string",
                                  "rule": "wrong-rule",
                                  "string": "definedAs"
                                  }"""
            assertThrows[Error] {
              Finder.fromJson(Json.parse(invalidExample))
            }

          }


        }

      }


      describe("Range") {

        it("on valid") {
          val validExample = """{
                                  "type": "range",
                                  "start": 15,
                                  "end": 24
                                  }"""

          val parsed = Finder.fromJson(Json.parse(validExample))
          assert(parsed.isInstanceOf[RangeFinder])
          assert(parsed.asInstanceOf[RangeFinder].start == 15)
          assert(parsed.asInstanceOf[RangeFinder].end == 24)
        }

        it("on invalid") {
          val invalidExample = """{
                                  "type": "range",
                                  "wrongKey": "wrong-rule",
                                  "end": 15
                                  }"""
          assertThrows[Error] {
            Finder.fromJson(Json.parse(invalidExample))
          }
        }

      }


      describe("Node") {
        it("on valid") {
          val validExample = """{
                                  "type": "node",
                                  "enterOn": "VariableDeclaration",
                                  "block": "function () {}"
                                  }"""

          val parsed = Finder.fromJson(Json.parse(validExample))
          assert(parsed.isInstanceOf[NodeFinder])
          assert(parsed.asInstanceOf[NodeFinder].enterOn == "VariableDeclaration")
          assert(parsed.asInstanceOf[NodeFinder].block == "function () {}")
        }

        it("on invalid") {
          val invalidExample = """{
                                  "type": "node",
                                  "wrongKey": "wrong-rule"
                                  }"""
          assertThrows[Error] {
            Finder.fromJson(Json.parse(invalidExample))
          }
        }

      }


      it("Rejects an invalid finder type") {
        val testJson = """{"type" : "not-real"}"""
        assertThrows[Error] {
          Finder.fromJson(Json.parse(testJson))
        }
      }

    }

  }

}

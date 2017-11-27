package com.opticdev.server.http.routes.query

import com.opticdev.server.http.routes.query.{AnyFile, In, InFiles, IsInFile}
import org.scalatest.FunSpec
import play.api.libs.json.{JsResultException, Json}

class IsInFileTest extends FunSpec {
  describe("Is in file predicates") {

    describe("parse from JSON") {
      it("when rule: 'Any'") {
        val json = Json.parse("""{"rule": "any"}""")
        assert(IsInFile.fromJson(json) == AnyFile)
      }

      it("when a single file") {
        val json = Json.parse(""" "path/to/file" """)
        assert(IsInFile.fromJson(json) == In("path/to/file"))
      }

      it("when multiple files") {
        val json = Json.parse(""" ["file1", "file1", "file2"] """)
        assert(IsInFile.fromJson(json) == InFiles(Set(
          "file1", "file2"
        )))
      }
    }

    describe("fail to parse") {

      it("when invalid rule") {
        val json = Json.parse("""{"rule": "notReal"}""")
        assertThrows[Error] {
          IsInFile.fromJson(json)
        }
      }

      it("when unhandled types") {
        val json = Json.parse("""false""")
        assertThrows[Error] {
          IsInFile.fromJson(json)
        }
      }

      it("when arrays contain things other than strings") {
        val json = Json.parse(""" ["fileA", 16] """)
        assertThrows[Error] {
          IsInFile.fromJson(json)
        }
      }

    }

  }
}

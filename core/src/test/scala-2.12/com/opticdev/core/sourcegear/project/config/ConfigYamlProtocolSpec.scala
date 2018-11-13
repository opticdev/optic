package com.opticdev.core.sourcegear.project.config
import com.opticdev.core.sourcegear.project.config.options.ConfigYamlProtocol._
import org.scalatest.FunSpec
import play.api.libs.json.Json

class ConfigYamlProtocolSpec extends FunSpec {

  it("can parse pf yaml") {
    val result = parsePrimary(
      """
        |name: Test Project
        |parsers:
        |  - es7
        |  - scala
      """.stripMargin)

    assert(result.isSuccess)
    assert(result.get.name == "Test Project")
    assert(result.get.parsers.contains(List("es7", "scala")))
  }

  it("will throw errors for invalid types") {
    val result = parsePrimary(
      """
        |name: Test Project
        |parsers:
        |  - 15
        |  - 15:
        |     - A
        |  - scala
      """.stripMargin)
    assert(result.isFailure)
  }


  describe("constant objects") {
    it("can parse objects from config") {
      val result = parsePrimary(
        """
          |name: Example
          |objects:
          |  - type: optic:test/id-of-thing
          |    value:
          |      key1: 1
          |      key2: 2
        """.stripMargin)

      assert(result.isSuccess)
      assert(result.get.objects.get.size == 1)
      assert(result.get.objects.get.head.`type`.full == "optic:test@latest/id-of-thing")
      assert(result.get.objects.get.head.value.toJson.toString() == """{"key2":2,"key1":1}""")
    }

    it("will reject if invalid schema ref") {
      val result = parsePrimary(
        """
          |name: Example
          |objects:
          |  - type: optic:dd
          |    value: STRING
        """.stripMargin)

      assert(result.failed.get.getMessage == "requirement failed: Invalid abstraction reference 'optic:dd'")
      assert(result.isFailure)
    }

    it("will reject if invalid type") {
      val result = parsePrimary(
        """
          |name: Example
          |objects:
          |  - type: optic:test/id-of-thing
          |    value: STRING
        """.stripMargin)

      assert(result.isFailure)
      assert(result.failed.get.getMessage == "Invalid Object Yaml: STRING")
    }
  }

  describe("default settings") {

    it("can parse default settings from config") {
      val result = parsePrimary(
        """
          |name: Example
          |defaults:
          |  optic:test/id-of-thing:
          |     value:
          |      key1: 1
          |      key2: 2
        """.stripMargin)
      assert(result.isSuccess)
      assert(result.get.defaults.get.head._1.full == "optic:test@latest/id-of-thing")
      assert(result.get.defaults.get.head._2.value.toJson == Json.parse("""{"key2":2,"key1":1}"""))

    }

    it("will fail to parse if keys aren't schema refs") {
      val result = parsePrimary(
        """
          |name: Example
          |defaults:
          |  /id-of-thing:
          |     value:
          |      key1: 1
          |      key2: 2
        """.stripMargin)

      assert(result.isFailure)

    }
  }

}

package com.opticdev.core.sourcegear.containers

import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.Fixture.compilerUtils.{GearUtils, ParserUtils}

class ContainerSpec extends TestBase with ParserUtils with GearUtils {

  describe("Subcontainers") {

    lazy val gearWithSubContainer = gearFromDescription("test-examples/resources/example_packages/optic:ShowConfirmAlert@0.1.0.json")

    def testBlock(fileContents: String) = {
      val parsed = sample(fileContents)
      val astGraph = parsed.astGraph
      val enterOn = parsed.entryChildren.head
      gearWithSubContainer.parser.matches(enterOn)(astGraph, fileContents, sourceGearContext, null)
    }

    it("can compile") {
      assert(gearWithSubContainer != null)
    }

    it("will include child rules") {
      assert(gearWithSubContainer.parser.rules.flatMap(_._2.map(_.isChildrenRule)).exists(_ == true))
    }

    describe("child rule evaluation") {
      //@todo implement these tests
    }

    it("can parse any content within if true and if false containers") {
      val test =
      """showConfirm('message', (didConfirm)=> {
        |        if (didConfirm) {
        |           whatever = code+Iwant
        |           const freePeople = (go)=> { myfunc(go) }
        |        } else {
        |           hereTo(we.are.free)
        |        }
        |})""".stripMargin

      val result = testBlock(test)

      assert(result.isDefined)
    }

    it("will parse if non-container areas are changed") {
      val test =
        """showConfirm('message', (didConfirm)=> {
          |        if (didConfirm != pizza) {
          |           whatever = code+Iwant
          |        } else {
          |           hereTo(we.are.free)
          |        }
          |})""".stripMargin

      assert(testBlock(test).isEmpty)

    }

  }




}

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

    it("can parse any content within if true and if false containers") {
      val test =
      """showConfirm('message', (didConfirm)=> {
        |        if (didConfirm) {
        |           whatever = code+Iwant
        |        } else {
        |           hereTo(we.are.free)
        |        }
        |})""".stripMargin

      assert(testBlock(test).isDefined)

    }

  }




}

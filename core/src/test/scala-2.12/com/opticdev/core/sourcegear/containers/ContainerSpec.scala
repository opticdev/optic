package com.opticdev.core.sourcegear.containers

import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.Fixture.compilerUtils.{GearUtils, ParserUtils}

class ContainerSpec extends TestBase with ParserUtils with GearUtils {

  describe("Subcontainers") {

    it("can compile") {
      lazy val gearWithSubContainer = gearFromDescription("test-examples/resources/example_packages/optic:ShowConfirmAlert@0.1.0.json")

      println(gearWithSubContainer)
    }

  }




}

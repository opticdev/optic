package LensCapabilities

import java.io.File

import Fixture.TestBase
import compiler.Compiler


class GroupTest extends TestBase {

  describe("Groups") {
    it("Can read a group lens") {
      val lensTestPath = "src/test/resources/lenses/group/GroupExampleLens.js"
      val output = parser.parse(new File(lensTestPath))

      assert(output.groups.size == 1)
    }

    describe("Group Compiler") {
      it("Can compile into a working lens") {
        val lensTestPath = "src/test/resources/lenses/group/GroupExampleLens.js"
        val output = parser.parse(new File(lensTestPath))

        val group = output.groups.head

        Compiler.compile(group)
      }
    }

  }

}

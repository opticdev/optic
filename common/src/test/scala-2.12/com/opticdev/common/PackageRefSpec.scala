package com.opticdev.common

import org.scalatest.FunSpec

class PackageRefSpec extends FunSpec {
  describe("Package Ref") {

    it("will be @latest by default") {
      assert(PackageRef("optic:test").version == "latest")
    }

    it("can be instantiated from string") {
      assert(PackageRef.fromString("optic:test@latest").get == PackageRef("optic:test", "latest"))
      assert(PackageRef.fromString("optic:test@2.1.2").get == PackageRef("optic:test", "2.1.2"))
      assert(PackageRef.fromString("optic:test@2.1.2").get == PackageRef("optic:test", "2.1.2"))
      assert(PackageRef.fromString("optic:test").get == PackageRef("optic:test", "latest"))
    }

  }
}

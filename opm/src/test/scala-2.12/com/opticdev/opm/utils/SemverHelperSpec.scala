package com.opticdev.opm.utils

import com.opticdev.common.Versioned
import org.scalatest.FunSpec

class SemverHelperSpec extends FunSpec {

  case class VersionedItem(version: String = "latest") extends Versioned

  val availableVersions = Set(
    VersionedItem("0.1.2"),
    VersionedItem("0.1.4"),
    VersionedItem("3.1.4"),
    VersionedItem("5.0.0")
  )


  it("will get the latest version when @latest is used") {
    assert(SemverHelper.findVersion(availableVersions, (a: VersionedItem) => a, "latest").get._1.toString
      == "5.0.0")

  }

  it("will get an exact version when specified") {

    assert(SemverHelper.findVersion(availableVersions, (a: VersionedItem) => a, "0.1.4").get._1.toString
      == "0.1.4")

  }

  it("works with NPM fuzzy rules") {

    assert(SemverHelper.findVersion(availableVersions, (a: VersionedItem) => a, "^0.1.1").get._1.toString
      == "0.1.4")

  }

  it("will return None if none found") {
    assert(SemverHelper.findVersion(availableVersions, (a: VersionedItem) => a, "9.1.1").isEmpty)
  }

}

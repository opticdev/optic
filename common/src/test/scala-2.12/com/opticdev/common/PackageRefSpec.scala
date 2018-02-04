package com.opticdev.common

import org.scalatest.FunSpec
import play.api.libs.json.Json

class PackageRefSpec extends FunSpec {
  it("will be @latest by default") {
    assert(PackageRef("optic:test").version == "latest")
  }

  it("can be instantiated from string") {
    assert(PackageRef.fromString("optic:test@latest").get == PackageRef("optic:test", "latest"))
    assert(PackageRef.fromString("optic:test@2.1.2").get == PackageRef("optic:test", "2.1.2"))
    assert(PackageRef.fromString("optic:test@2.1.2").get == PackageRef("optic:test", "2.1.2"))
    assert(PackageRef.fromString("optic:test").get == PackageRef("optic:test", "latest"))
  }

  it("can be written/loaded from JSON") {

    val test = PackageRef.fromString("optic:test@latest").get
    val test2 = PackageRef.fromString("optic:test@2.1.2").get
    val test3 = PackageRef.fromString("optic:test").get

    import PackageRef.packageRefJsonFormat

    assert(Json.fromJson[PackageRef](Json.toJson[PackageRef](test)).get == test)
    assert(Json.fromJson[PackageRef](Json.toJson[PackageRef](test2)).get == test2)
    assert(Json.fromJson[PackageRef](Json.toJson[PackageRef](test3)).get == test3)


  }

}

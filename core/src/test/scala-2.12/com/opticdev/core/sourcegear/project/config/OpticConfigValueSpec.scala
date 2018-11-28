package com.opticdev.core.sourcegear.project.config

import com.opticdev.core.sourcegear.project.config.options.{OCArray, OCBoolean, OCObject, OCString}
import org.scalatest.FunSpec
import play.api.libs.json.Json

class OpticConfigValueSpec extends FunSpec {

  it("can convert to JSON") {

    val ocObject = OCObject(Map(
      "hello" -> OCString("world"),
      "array" -> OCArray(OCString("Hello"), OCObject(Map("nested" -> OCBoolean(true))))
    ))

    assert(ocObject.toJson == Json.parse("""{"hello":"world","array":["Hello",{"nested":true}]}"""))

  }

}

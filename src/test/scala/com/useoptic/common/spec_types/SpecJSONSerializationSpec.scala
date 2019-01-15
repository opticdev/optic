package com.useoptic.common.spec_types

import com.useoptic.common.spec_types.SpecJSONSerialization.rangeJsonFormats
import org.scalatest.FunSpec
import play.api.libs.json.Json

class SpecJSONSerializationSpec extends FunSpec {

  it("can serialize range") {
    assert(Json.toJson[Range](Range(4, 16)).toString() == """{"start":4,"end":16}""")
  }

  it("can parse range") {
    assert(Json.fromJson[Range](Json.parse("""{"start":4,"end":16}""")).get == Range(4, 16))
  }

}
